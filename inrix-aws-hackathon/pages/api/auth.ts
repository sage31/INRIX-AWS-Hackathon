import {
  IAuthenticationDetailsData,
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
  ICognitoUserPoolData,
} from "amazon-cognito-identity-js";
import { NextApiRequest, NextApiResponse } from "next";

const cognitoPoolData: ICognitoUserPoolData = {
  UserPoolId: process.env.COGNITO_USER_POOL_ID as string, // Your User Pool ID
  ClientId: process.env.COGNITO_CLIENT_ID as string, // Your App Client ID
};

const userPool = new CognitoUserPool(cognitoPoolData);

interface LoginRequest {
  email: string;
  password: string;
}

interface ResponseData {
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method === "POST") {
    const body = req.body as LoginRequest;
    const { email, password } = body;
    const accessToken = await signIn(email, password);
    res
      .status(200)
      .setHeader(
        "Set-Cookie",
        `accessToken=${accessToken}; HttpOnly; Secure; SameSite=None`
      )
      .json({ message: "Login successful" });
  }
}

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
