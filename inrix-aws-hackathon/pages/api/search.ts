import { NextApiRequest, NextApiResponse } from 'next';
import { Client } from '@opensearch-project/opensearch';

const client = new Client({
  node: process.env.OPENSEARCH_ENDPOINT!,
  auth: {
    username: process.env.OPENSEARCH_USERNAME!,
    password: process.env.OPENSEARCH_PASSWORD!,
  },
});

interface ResponseData {
    s3_location: string;
    faces_in_picture: Record<string, string>;
    objects_in_picture: string;
}

// Function to extract unique URLs
function getUniqueS3Locations(responseData: ResponseData[]): string[] {
    const uniqueUrls = Array.from(new Set(responseData.map(item => item.s3_location)));
    return uniqueUrls;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { q } = req.query;

  if (typeof q !== 'string' || !q.trim()) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  console.log('Searching for:', q);

  try {
    //     # Query to get all documents from the index
    // # query = {
    // #     "query": {
    // #         "match": {
    // #             "objects_in_picture": "woman with coat"
    // #         }
    // #     }
    // # }
    const response = await client.search({
      index: 'images_index', // Replace with your index name
      body: {
        query: {
          match: {
            objects_in_picture: q, // Replace "title" with the field you're searching
          },
        },
      },
    });

    const results = response.body.hits.hits.map((hit: any) => hit._source);
    console.log(results);
    const unique_results = getUniqueS3Locations(results);
    console.log(unique_results);
    res.status(200).json(unique_results);
  } catch (error) {
    console.error('Error querying OpenSearch:', error);
    res.status(500).json({ error: 'Error querying OpenSearch' });
  }
}
// import { NextApiRequest, NextApiResponse } from 'next';
// import { Client } from '@opensearch-project/opensearch';

// const client = new Client({
//   node: process.env.OPENSEARCH_ENDPOINT!,
//   auth: {
//     username: process.env.OPENSEARCH_USERNAME!,
//     password: process.env.OPENSEARCH_PASSWORD!,
//   },
// });

// interface ResponseData {
//   s3_location: string;
//   faces_in_picture: Record<string, string>;
//   objects_in_picture: string;
// }

// // Function to extract unique URLs
// function getUniqueS3Locations(responseData: ResponseData[]): string[] {
//   return Array.from(new Set(responseData.map(item => item.s3_location)));
// }

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const { q } = req.query;

//   // Validate the query parameter
//   if (typeof q !== 'string' || !q.trim()) {
//     return res.status(400).json({ error: 'Query parameter is required and must be a non-empty string.' });
//   }

//   console.log('Searching for:', q);

//   try {
//     // Query OpenSearch
//     const response = await client.search({
//       index: 'images_index', // Replace with your actual index name
//       body: {
//         query: {
//           match: {
//             objects_in_picture: q, // Replace "objects_in_picture" with the field you're querying
//           },
//         },
//       },
//     });

//     // Extract results and deduplicate S3 locations
//     const results = response.body.hits.hits.map((hit: any) => hit._source);
//     const uniqueResults = getUniqueS3Locations(results);

//     console.log('Unique S3 Locations:', uniqueResults);

//     // Return unique results
//     res.status(200).json({ uniqueS3Locations: uniqueResults });
//   } catch (error) {
//     console.error('Error querying OpenSearch:', error);
//     res.status(500).json({ error: 'Error querying OpenSearch' });
//   }
// }
