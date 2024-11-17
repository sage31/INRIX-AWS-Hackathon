import {
  IAuthenticationDetailsData,
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
  ICognitoUserPoolData,
} from "amazon-cognito-identity-js";
import { createPool, PoolConnection } from "mysql";
import { JwksClient } from "jwks-rsa";
import fs from "fs";
import {
  JwtHeader,
  JwtPayload,
  SigningKeyCallback,
  verify,
} from "jsonwebtoken";
import {InvokeAsyncRequest, InvokeAsyncCommandInput, LambdaClient, InvokeAsyncCommand } from "@aws-sdk/client-lambda";
import { NextApiRequest, NextApiResponse } from "next";


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

const jwksClient = new JwksClient({
  jwksUri:
    "https://cognito-idp.us-west-2.amazonaws.com/us-west-2_H35dLt9ar/.well-known/jwks.json",
});
const cognitoPoolData: ICognitoUserPoolData = {
  UserPoolId: process.env.COGNITO_USER_POOL_ID as string, // Your User Pool ID
  ClientId: process.env.COGNITO_CLIENT_ID as string, // Your App Client ID
};

const userPool = new CognitoUserPool(cognitoPoolData);

interface ResponseData {
  message: string;
}
interface CreateScrapbookRequest {
  eventIds: string;
  groupIds: string;
}

interface GetScrapbookResponse {
    caption: string;
    photoUrls: string[];
}[];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
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
  if (req.method === "POST") {
    const body = JSON.parse(req.body) as CreateScrapbookRequest;
    const userId = await verifyToken(req.cookies.accessToken!);
    if (!userId) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }
    const invokeAsyncRequest: InvokeAsyncCommandInput = {
        FunctionName: "createScrapbook",
        InvokeArgs: JSON.stringify({
            userId,
            eventIds: body.eventIds,
            groupIds: body.groupIds,
        }),
    }
    const lambda = new LambdaClient({ region: "us-west-2" });
    try {
        await lambda.send(new InvokeAsyncCommand(invokeAsyncRequest));
        res.status(200).json({ message: "Scrapbook created" });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: "Error creating scrapbook" });
    }
    
  }
  if(req.method === "GET") {
    const userId = await verifyToken(req.cookies.accessToken!);
    if (!userId) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    const query = `SELECT caption, photoUrls FROM Scrapbook WHERE userId = ?`;
  }
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
