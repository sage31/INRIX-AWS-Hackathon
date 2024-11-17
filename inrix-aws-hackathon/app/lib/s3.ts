// lib/s3.ts
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN, // Include this for temporary credentials
    region: process.env.AWS_DEFAULT_REGION,
});

export const getS3Photos = async (bucketName: string, prefix: string) => {
  const params = {
    Bucket: bucketName,
    Prefix: prefix, // Optional: Use this if you have a folder structure
  };

  const data = await s3.listObjectsV2(params).promise();
  return data.Contents?.map((item) => ({
    key: item.Key,
    url: `https://${bucketName}.s3.${process.env.AWS_DEFAULT_REGION}.amazonaws.com/${item.Key}`,
  }));
};
