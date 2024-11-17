import type { NextApiRequest, NextApiResponse } from "next";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { createPool, PoolConnection } from "mysql";
import { promisify } from "util";

const writePool = createPool({
  host: process.env.MYSQL_WRITE_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  connectionLimit: 10,
});

const readPool = createPool({
  host: process.env.MYSQL_READ_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  connectionLimit: 10,
});

const s3 = new S3Client({ region: "us-west-2" });

interface GetGroupRequest {
  groupId: number;
}

interface GetGroupResponse {
  groupId: number;
  name: string;
  description: string;
  groupPhotoUrl: string;
  members: string[];
  events: Event[];
}

interface Event {
  eventId: number;
  name: string;
  description: string;
  eventDate: string;
  location: string;
  photos: Photo[];
  coverPhotoUrl: string;
  attendees: string[];
}

interface Photo {
  photoId: number;
  photoUrl: string;
  metadata: PhotoMetadata;
}

interface PhotoMetadata {
  usersInPhoto: string[];
}

interface CreateGroupRequest {
  name: string;
  description: string;
  photo: string; // Base64 encoded image
}

interface CreateGroupResponse {
  groupId: number;
}

interface UpdateGroupRequest {
  groupId: string;
  name: string;
  description: string;
  photo: string; // Base64 encoded image
}

interface MessageResponse {
  message: string;
}

type GroupResponse = MessageResponse | CreateGroupResponse | GetGroupResponse;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GroupResponse>
) {

  const dbWrite = await new Promise<PoolConnection>((resolve, reject) => {
    writePool.getConnection((err, connection) => {
      if (err) {
        console.log(err);
        res.status(500).json({ message: "Error connecting to database" });
        reject();
        return;
      }
      resolve(connection);
    });
  });
  const dbRead = await new Promise<PoolConnection>((resolve, reject) => {
    readPool.getConnection((err, connection) => {
      if (err) {
        console.log(err);
        res.status(500).json({ message: "Error connecting to database" });
        reject();
        return;
      }
      resolve(connection);
    });
  });
  await new Promise<void>((resolve, reject) => {
    dbWrite.beginTransaction((err) => {
      if (err) {
        console.log(err);
        res.status(500).json({ message: "Error starting transaction" });
        releaseConns(dbWrite, dbRead);
        reject();
        return;
      }
      resolve();
    });
  });

  if (req.method === "GET") {
    // Get the entire group.
    const groupId = req.query.groupId as string;
    const groupResponse = {} as GetGroupResponse;

    // const filterCondition = group.groupId
    //   ? `g.id = '${group.groupId}' `
    //   : `g.name = '${group.groupName}'`;
    const filterCondition = `g.id = '${groupId}'`;
    const groupQuery = `SELECT g.*, u.name as user_name FROM user_groups g
     left join group_members gm on g.id = gm.group_id
     left join users u on gm.user_id = u.id
     WHERE ${filterCondition};`;
    const getGroupPromise = new Promise<void>((resolve, reject) => {
      dbRead.query(groupQuery, (err, results, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({ message: "Error fetching group data" });
          releaseConns(dbWrite, dbRead);
          reject();
        }
        console.log("RESULTS" + results);
        groupResponse.groupId = results[0].id;
        groupResponse.name = results[0].name;
        groupResponse.description = results[0].description;
        groupResponse.members = results.filter((result: any) => result.user_name).map((result: any) => result.user_name);
        resolve();
      });
    });

    const getEventsAndAttendeesQuery = `SELECT 
    e.*,
    GROUP_CONCAT(DISTINCT p.photo_url) AS photo_urls, 
    GROUP_CONCAT(DISTINCT u.name) AS user_names
    FROM 
        events e
    left JOIN 
        event_photos ep ON e.id = ep.event_id
    left JOIN 
        photos p ON ep.photo_id = p.id
    left JOIN 
        event_attendees ea ON e.id = ea.event_id
    left JOIN 
        users u ON ea.user_id = u.id
    WHERE 
        e.group_id = ${groupId}
    GROUP BY 
        e.id;
    `;
    const getEventsPromise = new Promise<void>((resolve, reject) => {
      dbRead.query(getEventsAndAttendeesQuery, async (err, results, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({ message: "Error fetching events data" });
          releaseConns(dbWrite, dbRead);
          reject();
          return;
        }

        const eventPromises: Promise<any>[] = [];

        for (const result of results) {
          // Collect photo promises for parallel resolution
          const photoPromises = result.photo_urls
            .split(",")
            .map(async (photoUrl: string) => {
              const users = await getUsersInPhoto(result.id, dbRead);
              return {
                photoId: 0,
                photoUrl,
                metadata: {
                  usersInPhoto: users,
                },
              };
            });

          // Push a promise that resolves the photos for this event
          const eventPromise = Promise.all(photoPromises).then(async (photos) => ({
            eventId: result.id,
            name: result.name,
            description: result.description,
            eventDate: result.date,
            location: result.location,
            photos,
            coverPhotoUrl: result.cover_photo_id ? await getPhotoUrl(result.cover_photo_id) : "",
            attendees: result.user_names?.split(",") || [],
          }));
          eventPromises.push(eventPromise);
        }

        // Wait for all events to resolve and populate the groupResponse
        groupResponse.events = await Promise.all(eventPromises);
        resolve();
      });
    });

    await Promise.all([getGroupPromise, getEventsPromise]);

    res.status(200).json(groupResponse);
  }
  if (req.method === "POST") {
    // Process a create group  request
    const group: CreateGroupRequest = JSON.parse(req.body);
    console.log("GROUP" + group);
    const photoUrl = await uploadPhotoToS3(group.photo, dbRead, dbWrite);
    const createGroupQuery = `INSERT INTO user_groups (name, description, photo_url) VALUES ('${group.name}', '${group.description}', '${photoUrl}' );`;
    dbWrite.query(createGroupQuery, (err, results, fields) => {
      if (err) {
        console.log(err);
        res.status(500).json({ message: "Error creating group" });
        releaseConns(dbWrite, dbRead);
        return;
      }
      res.status(200).json({ groupId: results.insertId });
    });
  }

  if (req.method === "PUT") {
    // Process a update group request
    const group: UpdateGroupRequest = req.body;
    const updateNameStatement = group.name ? `name = '${group.name}'` : "";
    const updateDescriptionStatement = group.description
      ? `description = '${group.description}'`
      : "";
    const updatePhotoStatement = group.photo
      ? `photo_url = '${await uploadPhotoToS3(group.photo, dbRead, dbWrite)}'`
      : "";
    const updateStatements = [
      updateNameStatement,
      updateDescriptionStatement,
      updatePhotoStatement,
    ]
      .filter((s) => s.length > 0)
      .join(", ");
    const updateGroupQuery = `UPDATE user_groups SET ${updateStatements} WHERE id = ${group.groupId};`;
    dbWrite.query(updateGroupQuery, (err, results, fields) => {
      if (err) {
        console.log(err);
        res.status(500).json({ message: "Error updating group" });
        releaseConns(dbWrite, dbRead);
        return;
      }
      res.status(200).json({ message: "Group updated" });
    });
  }
  releaseConns(dbWrite, dbRead);
  await new Promise<void>((resolve, reject) => {
    dbWrite.commit((err) => {
      if (err) {
        console.log(err);
        res.status(500).json({ message: "Error committing transaction" });
        releaseConns(dbWrite, dbRead);
        reject();
        return;
      }
      resolve();
    });
  });

  res.status(200).json({ message: "Hello from Next.js!" });
}

async function getPhotoUrl(photoId: number): Promise<string> {
  const query = `SELECT photo_url FROM photos WHERE id = ${photoId};`;
  return new Promise<string>((resolve, reject) => {
    readPool.query(query, (err, results, fields) => {
      if (err) {
        console.log(err);
        reject(err);
        return;
      }
      resolve(results[0].photo_url);
    });
  });
}

async function uploadPhotoToS3(
  photo: string,
  dbRead: PoolConnection,
  dbWrite: PoolConnection
): Promise<string> {
  const nextPhotoId = await getNextPhotoId(dbRead);
  // Upload photo to s3 as photos/nextPhotoId.jpg
  const photoParams = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `photos/${nextPhotoId}`,
    Body: Buffer.from(photo, "base64"),
    ContentType: "image/jpeg",
    ACL: "public-read",
  });
  await s3.send(photoParams);
  const url = `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/photos/${nextPhotoId}`;
  const photoQuery = `INSERT INTO photos (photo_url) VALUES ('${url}');`;
  await new Promise<void>((resolve, reject) => {
    dbWrite.query(photoQuery, (err, results, fields) => {
      if (err) {
        console.log(err);
      }
    });
    resolve();
  });
  return url;
}

async function getUsersInPhoto(
  photoId: string,
  dbRead: PoolConnection
): Promise<string[]> {
  const query = `SELECT u.name FROM users u 
  join faces f on f.user_id = u.id
  join photo_faces pf on f.id = pf.face_id
  where pf.photo_id = ${photoId};`;
  return new Promise<string[]>((resolve, reject) => {
    dbRead.query(query, (err, results, fields) => {
      if (err) {
        console.log(err);
        reject(err);
        return;
      }
      resolve(results.map((result: any) => result.name));
    });
  });
}

async function getNextPhotoId(dbRead: PoolConnection): Promise<number> {
  const query = "SELECT MAX(id) as max_photo_id FROM photos";
  return new Promise<number>((resolve, reject) => {
    dbRead.query(query, (err, results, fields) => {
      if (err) {
        console.log(err);
        reject(err);
        return;
      }
      resolve(results[0].max_photo_id + 1);
    });
  });
}

function releaseConns(dbWrite: PoolConnection, dbRead: PoolConnection) {
  if (dbWrite.state === "connected") {
    dbWrite.release();
  }
  if (dbRead.state === "connected") {
    dbRead.release();
  }
}
