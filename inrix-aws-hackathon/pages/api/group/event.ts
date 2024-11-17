import type { NextApiRequest, NextApiResponse } from "next";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { createPool, PoolConnection } from "mysql";
import next from "next";
import { maxHeaderSize } from "http";

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

interface PhotoMetadata {
  usersInPhoto: string[];
}

interface CreateEventRequest {
  name: string;
  groupId: number;
  description: string;
  date: string;
  location: string;
  coverPhoto: string;
  photos: string[];
  creatorId: number;
}

interface CreateEventResponse {
  eventId: number;
}

interface UpdateEventRequest {
  eventId: string;
  name: string;
  group_id: number;
  description: string;
  date: string;
  location: string;
  addPhotos: string[]; // Base64 encoded images
  removePhotos: number[]; // IDs of photos to remove
}

interface MessageResponse {
  message: string;
}

type EventResponse = MessageResponse | CreateEventResponse;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EventResponse>
) {
  const dbWrite = await new Promise<PoolConnection>((resolve, reject) => {
    writePool.getConnection((err, connection) => {
      if (err) {
        reject(err);
      } else {
        resolve(connection);
      }
    });
  });
  const dbRead = await new Promise<PoolConnection>((resolve, reject) => {
    readPool.getConnection((err, connection) => {
      if (err) {
        reject(err);
      } else {
        resolve(connection);
      }
    });
  });

  
  let nextPhotoId = await getNextPhotoId(dbRead);

  if (req.method === "POST") {
    // Process a create event request.
    const body = req.body as CreateEventRequest;
    const photos = body.photos;
    const photoUploads = [];
    const photosToUpload = body.coverPhoto ? [body.coverPhoto, ...photos] : photos;
    for (const photo of photosToUpload) {
      photoUploads.push(uploadPhotoToS3(photo, dbWrite, nextPhotoId));
      nextPhotoId++;
    }
    const uploadedPhotos = await Promise.all(photoUploads);
    let coverPhotoId: number | null = null;
    if(body.coverPhoto) {
      coverPhotoId = uploadedPhotos[0].id;
      uploadedPhotos.splice(0, 1);
    }
    const photoIds = uploadedPhotos.map((photo) => photo.id);
    // Call async process images to get face metadata.
    body.date = body.date ? toSqlDate(body.date) : toSqlDate(new Date().toISOString());
    const eventQuery = `INSERT INTO events (name, group_id, description, date, location, cover_photo_id, creator_id) 
    VALUES ('${body.name}', ${body.groupId}, '${body.description}', '${body.date}', '${body.location}', ${coverPhotoId}, ${body.creatorId});`;
    const eventId = await new Promise<number>((resolve, reject) => {
      dbWrite.query(eventQuery, (err, results, fields) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve(results.insertId);
      });
    });
    const eventPhotoInserts = photoIds.map((id) => `(${eventId}, ${id})`).join(",");
    const photoQuery = `INSERT INTO event_photos (event_id, photo_id) VALUES ${eventPhotoInserts};`;
    await new Promise<void>((resolve, reject) => {
      dbWrite.query(photoQuery, (err, results, fields) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve();
      });
    });
    res.status(200).json({ eventId });
  }
  if (req.method === "PUT") {
    // Process a update user request
  }
  res.status(200).json({ message: "Hello from Next.js!" });
  releaseConns(dbWrite, dbRead);
}

function toSqlDate(date: string): string {
  return new Date(date).toISOString().slice(0, 19).replace("T", " ");
}

export const config = {
  // Specifies the maximum allowed duration for this function to execute (in seconds)
  api: {
    // Add file limit 10mb
    bodyParser: {
      sizeLimit: 1024 * 1024 * 15,
    },
  },
  maxDuration: 10,
};

interface Photo {
  url: string;
  id: number;
}
async function uploadPhotoToS3(
  photo: string,
  dbWrite: PoolConnection,
  nextPhotoId: number
): Promise<Photo> {
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
  const id = await new Promise<number>((resolve, reject) => {
    dbWrite.query(photoQuery, (err, results, fields) => {
      if (err) {
        console.log(err);
      }
      resolve(results.insertId);
    });
  });
  // Call rosalie API
  return { url, id };
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
