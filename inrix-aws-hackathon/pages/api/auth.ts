import {
  IAuthenticationDetailsData,
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
  ICognitoUserPoolData,
} from "amazon-cognito-identity-js";
import { NextApiRequest, NextApiResponse } from "next";

import { File, IncomingForm } from "formidable";

const cognitoPoolData: ICognitoUserPoolData = {
  UserPoolId: process.env.COGNITO_USER_POOL_ID as string, // Your User Pool ID
  ClientId: process.env.COGNITO_CLIENT_ID as string, // Your App Client ID
};

const userPool = new CognitoUserPool(cognitoPoolData);

interface ResponseData {
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method === "POST") {
    const form = new IncomingForm();

    const [formFields, files] = await form.parse(req);
    const accessToken = await signIn(
      formFields.email![0],
      formFields.password![0]
    );
    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000).toUTCString();
    res.setHeader("access-control-expose-headers", "Set-Cookie");
    res.setHeader(
      "Set-Cookie",
      `accessToken=${accessToken}; Path=/; SameSite=Lax; Expires=${oneHourFromNow};`
    );
    res.redirect(303, "/");
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};

function signIn(email: string, password: string) {
  return new Promise((resolve, reject) => {
    const authenticationData: IAuthenticationDetailsData = {
      Username: email,
      Password: password,
    };

    const authenticationDetails = new AuthenticationDetails(authenticationData);

    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        // Successful sign-in
        const accessToken = result.getIdToken().getJwtToken();
        resolve(accessToken);
      },
      onFailure: (err) => {
        // Handle error
        console.error("Sign-in failed:", err);
        reject(err);
      },
    });
  });
}
