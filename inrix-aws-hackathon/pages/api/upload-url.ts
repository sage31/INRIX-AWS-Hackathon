import { NextApiRequest, NextApiResponse } from "next";
import AWS from "aws-sdk";

// Configure AWS SDK
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN,
  region: process.env.AWS_DEFAULT_REGION,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { filename, filetype } = req.body;

    if (!filename || !filetype) {
      return res.status(400).json({ error: "Filename and filetype are required." });
    }

    // S3 parameters
    const params = {
      Bucket: "scu-hackathon-bucket", // Replace with your bucket name
      Key: `photos/${filename}`,      // Save files in the "photos/" folder
      ContentType: filetype,
      Expires: 60,                   // Pre-signed URL expiration (in seconds),
      ACL: "public-read",
    };

    try {
      const uploadUrl = await s3.getSignedUrlPromise("putObject", params);
      return res.status(200).json({ uploadUrl });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      return res.status(500).json({ error: "Could not generate upload URL." });
    }
  }

  // Allow only POST requests
  res.setHeader("Allow", ["POST"]);
  return res.status(405).json({ error: `Method ${req.method} not allowed.` });
}
