import type { NextApiRequest, NextApiResponse } from "next";
import { createPool, PoolConnection } from "mysql";
import {
  CognitoUser,
  CognitoUserPool,
  AuthenticationDetails,
  ICognitoUserPoolData,
  CognitoUserAttribute,
  IAuthenticationDetailsData,
} from "amazon-cognito-identity-js";
import {
  AdminConfirmSignUpCommand,
  CognitoIdentityProviderClient,
  GetGroupResponse,
} from "@aws-sdk/client-cognito-identity-provider";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { File, IncomingForm } from "formidable";
import { JwksClient } from "jwks-rsa";
import fs from "fs";
import {
  JwtHeader,
  JwtPayload,
  SigningKeyCallback,
  verify,
} from "jsonwebtoken";

const s3 = new S3Client({ region: "us-west-2" });
const jwksClient = new JwksClient({
  jwksUri:
    "https://cognito-idp.us-west-2.amazonaws.com/us-west-2_H35dLt9ar/.well-known/jwks.json",
});

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

const cognitoPoolData: ICognitoUserPoolData = {
  UserPoolId: process.env.COGNITO_USER_POOL_ID as string, // Your User Pool ID
  ClientId: process.env.COGNITO_CLIENT_ID as string, // Your App Client ID
};

const cognitoClient = new CognitoIdentityProviderClient({
  region: "us-west-2",
});

const userPool = new CognitoUserPool(cognitoPoolData);

interface GetUserResponse {
  myGroups: {
    id: string;
    name: string;
    description: string;
    groupPhotoUrl: string;
  }[];
  notMyGroups: {
    id: string;
    name: string;
    description: string;
    groupPhotoUrl: string;
  }[];
}

interface CreateUserRequest {
  name: string;
  email: string;
  userPhoto: string; // Base64 encoded image
  password: string;
}

interface CreateUserResponse {
  userId: number;
}

interface UpdateUserRequest {
  userId: number;
  joinGroups: number[];
  leaveGroups: number[];
  addEvents: number[];
  removeEvents: number[];
}

interface MessageResponse {
  message: string;
}

type UserResponse = MessageResponse | CreateUserResponse | GetUserResponse;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserResponse>
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

  if (req.method === "GET") {
    const token = req.cookies.accessToken;
    console.log("backend request");
    if (!token) {
      res.status(401).json({ message: "Unauthorized" });
      releaseConns(dbWrite, dbRead);
      return;
    }
    const userId = await verifyToken(token);
    const query = `SELECT g.id, g.name, g.description, g.photo_url FROM user_groups g 
    JOIN group_members gm on gm.group_id = g.id 
    WHERE gm.user_id = ${userId};`;
    const notMyGroupsQuery = `SELECT g.id, g.name, g.description, g.photo_url FROM user_groups g
    WHERE g.id NOT IN (SELECT gm.group_id FROM group_members gm WHERE gm.user_id = ${userId});`;
    const resp = {} as GetUserResponse;
    const getMyGroups = new Promise<void>((resolve, reject) => {
      dbRead.query(query, (err, results, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({ message: "Error getting user" });
          releaseConns(dbWrite, dbRead);
          resolve();
          return;
        }
        const groups = results.map((group: any) => {
          return {
            id: group.id,
            name: group.name,
            description: group.description,
            groupPhotoUrl: group.photo_url,
          };
        });
        resp.myGroups = groups;
        resolve();
      });
    });
    const getNotMyGroups = new Promise<void>((resolve, reject) => {
      dbRead.query(notMyGroupsQuery, (err, results, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({ message: "Error getting user" });
          releaseConns(dbWrite, dbRead);
          resolve();
          return;
        }
        const groups = results.map((group: any) => {
          return {
            id: group.id,
            name: group.name,
            description: group.description,
            groupPhotoUrl: group.photo_url,
          };
        });
        resp.notMyGroups = groups;
        resolve();
      });
    });
    await Promise.all([getMyGroups, getNotMyGroups]);
    res.status(200).json(resp);
  }
  if (req.method === "POST") {
    const form = new IncomingForm();

    const [formFields, files] = await form.parse(req);
    const b64Photo = await getB64Image(files.photo![0]);
    const userPhotoUrl = await uploadPhotoToS3(b64Photo, dbRead, dbWrite);

    const query = `INSERT INTO users (name, email, default_photo_url) VALUES ('${formFields.name}', '${formFields.email}', '${userPhotoUrl}');`;
    await new Promise<void>((resolve, reject) => {
      dbWrite.query(query, async (err, results, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({ message: "Error creating user" });
          releaseConns(dbWrite, dbRead);
          return;
        }
        const { accessToken, accessTokenExpires } = await signUp(
          results.insertId,
          formFields.email![0],
          formFields.password![0]
        );
        const oneHourFromNow = new Date(
          Date.now() + 60 * 60 * 1000
        ).toUTCString();
        res.setHeader("access-control-expose-headers", "Set-Cookie");
        res.setHeader(
          "Set-Cookie",
          `accessToken=${accessToken}; Path=/; SameSite=Lax; Expires=${oneHourFromNow};`
        );
        res.redirect(303, "/");
        releaseConns(dbWrite, dbRead);
        resolve();
      });
    });
  }
  if (req.method === "PUT") {
    const readable = req.read();
    const buffer = Buffer.from(readable);
    const data = JSON.parse(buffer.toString());
    // Process a update user request
    const updateUserRequest = data as UpdateUserRequest;
    const userId = updateUserRequest.userId;
    const joinGroups = updateUserRequest.joinGroups || [];
    const leaveGroups = updateUserRequest.leaveGroups || [];
    const addEvents = updateUserRequest.addEvents || [];
    const removeEvents = updateUserRequest.removeEvents || [];
    const values = joinGroups
      .map((groupId) => `(${userId}, ${groupId})`)
      .join(", ");
    const joinGroupQuery = `INSERT INTO group_members (user_id, group_id) VALUES ${values};`;
    const leaveGroupQuery = `DELETE FROM group_members WHERE user_id = ${userId} AND group_id IN (${leaveGroups.join(", ")});`;
    const joinGroupsPromise = new Promise<void>((resolve, reject) => {
      if (joinGroups.length === 0) {
        resolve();
        return;
      }
      dbWrite.query(joinGroupQuery, (err, results, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({ message: "Error joining groups" });
          releaseConns(dbWrite, dbRead);
          reject();
          return;
        }
        resolve();
      });
    });
    const leaveGroupsPromise = new Promise<void>((resolve, reject) => {
      if (leaveGroups.length === 0) {
        resolve();
        return;
      }
      dbWrite.query(leaveGroupQuery, (err, results, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({ message: "Error leaving groups" });
          releaseConns(dbWrite, dbRead);
          reject();
          return;
        }
        resolve();
      });
    });
    const addEventsPromise = new Promise<void>((resolve, reject) => {
      if (addEvents.length === 0) {
        resolve();
        return;
      }
      // Add events
      const values = addEvents
        .map((eventId) => `(${userId}, ${eventId})`)
        .join(", ");
      const addEventsQuery = `INSERT INTO event_attendees (user_id, event_id) VALUES ${values};`;
      dbWrite.query(addEventsQuery, (err, results, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({ message: "Error adding events" });
          releaseConns(dbWrite, dbRead);
          reject();
          return;
        }
        resolve();
      });
    });
    const removeEventsPromise = new Promise<void>((resolve, reject) => {
      if (removeEvents.length === 0) {
        resolve();
        return;
      }
      // Remove events
      const removeEventsQuery = `DELETE FROM event_attendees WHERE user_id = ${userId} AND event_id IN (${removeEvents.join(", ")});`;
      dbWrite.query(removeEventsQuery, (err, results, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({ message: "Error removing events" });
          releaseConns(dbWrite, dbRead);
          reject();
          return;
        }

        resolve();
      });
    });
    await Promise.all([
      joinGroupsPromise,
      leaveGroupsPromise,
      addEventsPromise,
      removeEventsPromise,
    ]);
    res.status(200).json({ message: "User updated." });
    releaseConns(dbWrite, dbRead);
  }
  res.status(200).json({ message: "Hello from Next.js!" });
}

export const config = {
  // Specifies the maximum allowed duration for this function to execute (in seconds)
  api: {
    bodyParser: false,
  },
  maxDuration: 5,
};

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
  // Call rosalie API
  return url;
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

function signUp(userId: number, email: string, password: string) {
  return new Promise<{ accessToken: string; accessTokenExpires: string }>(
    (resolve, reject) => {
      const attributeList: CognitoUserAttribute[] = [
        new CognitoUserAttribute({
          Name: "email",
          Value: email,
        }),
        new CognitoUserAttribute({
          Name: "custom:id",
          Value: String(userId),
        }),
      ];
      const validationData: CognitoUserAttribute[] = [];
      userPool.signUp(
        email,
        password,
        attributeList,
        validationData,
        async (err, result) => {
          if (err) return reject(err);
          if (result) {
            const confirmSignUpCommand = new AdminConfirmSignUpCommand({
              Username: email,
              UserPoolId: process.env.COGNITO_USER_POOL_ID,
            });
            cognitoClient.send(confirmSignUpCommand);
            resolve(await signIn(email, password));
          }
        }
      );
    }
  );
}

function signIn(email: string, password: string) {
  return new Promise<{ accessToken: string; accessTokenExpires: string }>(
    (resolve, reject) => {
      const authenticationData: IAuthenticationDetailsData = {
        Username: email,
        Password: password,
      };

      const authenticationDetails = new AuthenticationDetails(
        authenticationData
      );

      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          // Successful sign-in
          const accessToken = result.getIdToken().getJwtToken();
          const accessTokenExpires = new Date(
            result.getIdToken().getExpiration()
          ).toUTCString();
          resolve({ accessToken, accessTokenExpires });
        },
        onFailure: (err) => {
          // Handle error
          console.error("Sign-in failed:", err);
          reject(err);
        },
      });
    }
  );
}

async function getB64Image(file: File) {
  return new Promise<string>((resolve, reject) => {
    const filePath = file.filepath; // Get the file path

    // Read the file and convert it to base64
    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.error("Error reading file:", err);
        return;
      }

      // Convert the file to base64
      const base64String = data.toString("base64");
      resolve(base64String);
    });
  });
}

function getKey(header: JwtHeader, callback: SigningKeyCallback) {
  jwksClient.getSigningKey(header.kid, (err, key) => {
    if (err) {
      return callback(err, undefined);
    }
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

async function verifyToken(token: string) {
  return new Promise((resolve, reject) => {
    verify(
      token,
      getKey,
      {
        algorithms: ["RS256"], // Ensure the correct algorithm is used
      },
      (err, decoded) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          resolve((decoded as JwtPayload)["custom:id"]); // Decoded claims
        }
      }
    );
  });
}
