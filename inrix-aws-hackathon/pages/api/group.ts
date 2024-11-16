import type { NextApiRequest, NextApiResponse } from 'next'
 
type ResponseData = {
  message: string
}

interface CreateGroupRequest {
    name: string;
    description: string;
    groupPhoto: string; // Base64 encoded image
}

interface UpdateGroupRequest {
    name: string;
    description: string;
    groupPhoto: string; // Base64 encoded image
}

interface GetGroupRequest {
  groupName: string;
}
 
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if(req.method === 'POST') {
    // Process a create group  request
  }
  if(req.method === 'GET') {
    // Process a get group request
  }
  if(req.method === 'PUT') {
    // Process a update group request
  }
  res.status(200).json({ message: 'Hello from Next.js!' })
}