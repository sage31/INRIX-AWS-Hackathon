// "use client";

// import { filter } from "framer-motion/client";
// import { useEffect, useState } from "react";

// interface Photo {
//   key: string; // Unique identifier for the photo
//   url: string; // URL for the photo
// }

// interface PhotoFeedProps {
//     s3Locations?: string[]; // Optional list of S3 locations to exclude
//   }

// const PhotoFeed: React.FC<PhotoFeedProps> = ({s3Locations = []}) => {
//   const [photos, setPhotos] = useState<Photo[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   // Fetch photos on component mount
//   useEffect(() => {
//     const fetchPhotos = async () => {
//       try {
//         console.log("s3Locations:", s3Locations);
//         const response = await fetch("/api/photos");

//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const data: Photo[] = await response.json();
//         const filteredData = data.filter((photo) => !s3Locations.includes(photo.url));

//         console.log(filteredData);
//         setPhotos(filteredData);
//         console.log(filteredData);
//         setPhotos(filteredData);
//       } catch (err) {
//         setError("Failed to load photos. Please try again later.");
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPhotos();
//   }, []);

//   // Handle different states
//   if (loading) {
//     return (
//       <div className="loading-container">
//         <p>Loading photos...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="error-container">
//         <p>{error}</p>
//       </div>
//     );
//   }

//   if (photos.length === 0) {
//     return (
//       <div className="empty-container">
//         <p>No photos available.</p>
//       </div>
//     );
//   }
//   // Render photo grid
//   return (
      
//     <div className="photo-feed">
//       {photos.map((photo) => (
//         <div key={photo.key} className="photo-item"> {/* Use the unique `key` */}
//           <img src={photo.url} alt={photo.key} onError={() => console.error("Image failed to load:", photo.url)} />
//         </div>
//       ))}

//       <style jsx>{`
//         .photo-feed {
//           display: grid;
//           grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
//           gap: 16px;
//           padding: 16px;
//         }

//         .photo-item img {
//           width: 100%;
//           height: auto;
//           border-radius: 8px;
//           box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
//           transition: transform 0.2s, box-shadow 0.2s;
//         }

//         .photo-item img:hover {
//           transform: scale(1.05);
//           box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
//         }

//         .loading-container,
//         .error-container,
//         .empty-container {
//           text-align: center;
//           padding: 32px;
//         }

//         .loading-container p {
//           font-size: 18px;
//           font-weight: bold;
//         }

//         .error-container p {
//           font-size: 18px;
//           font-weight: bold;
//           color: red;
//         }

//         .empty-container p {
//           font-size: 18px;
//           font-weight: bold;
//           color: gray;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default PhotoFeed;

"use client";

import { filter } from "framer-motion/client";
import { useEffect, useState } from "react";

interface Photo {
  key: string; // Unique identifier for the photo
  url: string; // URL for the photo
}

interface PhotoFeedProps {
  s3Locations?: string[]; // Optional list of S3 locations to exclude
}

const PhotoFeed: React.FC<PhotoFeedProps> = ({ s3Locations = [] }) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch photos and apply filter dynamically
  useEffect(() => {
    const normalizeS3Location = (s3Location: string): string => {
        return s3Location
          .replace(/^s3:\/\//, "https://") // Replace `s3://` with `https://`
          .replace(/([^:])\/\//g, "$1/") // Replace double slashes in paths (excluding `https://`)
          .replace(/^https:\/\/([^/]+)\//, "https://$1.s3.us-west-2.amazonaws.com/"); // Add S3 region if needed
      };
      
      
      
      const fetchPhotos = async () => {
        try {
          setLoading(true);
          console.log("s3Locations:", s3Locations);
      
          const response = await fetch("/api/photos");
      
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
      
          const data: Photo[] = await response.json();
      
          // Normalize S3 locations for comparison
          const normalizedLocations = s3Locations.map(normalizeS3Location);

          console.log("normalizedLocations:", normalizedLocations);
      
          // Filter photos based on normalized URLs
          let filteredData = data;
          if (s3Locations.length > 0) {
            filteredData = data.filter((photo) => normalizedLocations.includes(photo.url));
          }
          
      
          setPhotos((prev) => {
            const prevUrls = prev.map((p) => p.url).sort();
            const newUrls = filteredData.map((p) => p.url).sort();
      
            return JSON.stringify(prevUrls) === JSON.stringify(newUrls)
              ? prev
              : filteredData;
          });
        } catch (err) {
          setError("Failed to load photos. Please try again later.");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };      

    fetchPhotos();
  }, [s3Locations]);

  // Handle different states
  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading photos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="empty-container">
        <p>No photos available.</p>
      </div>
    );
  }

  // Render photo grid
  return (
    <div className="photo-feed">
      {photos.map((photo) => (
        <div key={photo.key} className="photo-item">
          <img
            src={photo.url}
            alt={`Photo ${photo.key}`}
            onError={(e) => {
              console.error("Image failed to load:", photo.url);
              (e.target as HTMLImageElement).style.display = "none"; // Hide broken image
            }}
          />
        </div>
      ))}

      <style jsx>{`
        .photo-feed {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 16px;
          padding: 16px;
        }

        .photo-item img {
          width: 100%;
          height: auto;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .photo-item img:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }

        .loading-container,
        .error-container,
        .empty-container {
          text-align: center;
          padding: 32px;
        }

        .loading-container p {
          font-size: 18px;
          font-weight: bold;
        }

        .error-container p {
          font-size: 18px;
          font-weight: bold;
          color: red;
        }

        .empty-container p {
          font-size: 18px;
          font-weight: bold;
          color: gray;
        }
      `}</style>
    </div>
  );
};

export default PhotoFeed;
