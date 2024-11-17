import type { NextApiRequest, NextApiResponse } from 'next'
 
type ResponseData = {
  message: string
}

interface GetPhotosRequest {
    userId: string;
    userPhoto: string; // Base64 encoded image
    eventIds: string[];
}

enum AssociatedEntity {
    UserFace,
    Event,
    EventCover,
    Group,
}

interface CreatePhotoRequest {
    photoUrl: string;
    photoType: AssociatedEntity;
    entityId: string;
}

interface UpdatePhotoRequest {
    associatedFaces : number[];
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