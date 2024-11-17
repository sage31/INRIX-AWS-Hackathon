// pages/api/photos.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getS3Photos } from '@/app/lib/s3';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const bucketName = process.env.AWS_BUCKET_NAME!;
    const prefix = 'photos/'; // Change to your S3 folder structure if needed
    const photos = await getS3Photos(bucketName, prefix);

    res.status(200).json(photos);
  } catch (error) {
    console.error('Error fetching photos from S3:', error);
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
}
