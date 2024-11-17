import type { NextApiRequest, NextApiResponse } from 'next'

type ResponseData = {
  message: string
}

interface GetEventRequest {
    eventId: string;
}

interface GetEventResponse {
    name: string;
    description: string;
    eventDate: string;
    photos:
    {
        photoId: string;
        photoUrl: string;
        metadata: PhotoMetadata;
    }[];
}

interface PhotoMetadata {
    usersInPhoto: string[];
}

interface CreateEventRequest {
    name: string;
    description: string;
    eventDate: string;
    photos:
    {
        photoId: string;
        photo: string; // Base64 encoded image
    }[];
}

interface UpdateEventRequest {
    groupId: string;
    addPhotos:
    {
        photoId: string;
        photo: string; // Base64 encoded image
    }[];
    removePhotos:
    {
        photoId: string;
    }[];
}
 
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
    if(req.method === 'POST') {
        // Process a create user request
        
    }
    if(req.method === 'PUT') {
        // Process a update user request
    }
  res.status(200).json({ message: 'Hello from Next.js!' })
}

export const config = {
    api: {
      bodyParser: {
        sizeLimit: '1mb',
      },
    },
    // Specifies the maximum allowed duration for this function to execute (in seconds)
    maxDuration: 5,
  }