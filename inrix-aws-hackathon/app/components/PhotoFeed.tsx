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
      
      function filterList(listA: string[], listB: string[]): string[] {
        // Return items from listA that are not in listB
        return listA.filter(item => !listB.includes(item));
      }
      
      
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
        //   const filter_urls = ["s3://scu-hackathon-bucket/photos/19", "s3://scu-hackathon-bucket/photos/20", "s3://scu-hackathon-bucket/photos/21", "s3://scu-hackathon-bucket/photos/22", "s3://scu-hackathon-bucket/photos/23", "s3://scu-hackathon-bucket/photos/24", "s3://scu-hackathon-bucket/photos/25"]
        //   normalizedLocations = normalizedLocations.concat(filter_urls);

          // Filter photos based on normalized URLs
          const filter_urls = ["https://scu-hackathon-bucket.s3.us-west-2.amazonaws.com/photos/19", "https://scu-hackathon-bucket.s3.us-west-2.amazonaws.com/photos/20", "https://scu-hackathon-bucket.s3.us-west-2.amazonaws.com/photos/21", "https://scu-hackathon-bucket.s3.us-west-2.amazonaws.com/photos/22", "s3://scu-hackathon-bucket/photos/23", "s3://scu-hackathon-bucket/photos/24", "s3://scu-hackathon-bucket/photos/25"]
          let filteredData = data;
          console.log("urls", filteredData.map((photo) => photo.url));
          if (s3Locations.length > 0) {
            filteredData = data.filter((photo) => normalizedLocations.includes(photo.url) && !filter_urls.includes(photo.url));
          } else {
            filteredData = data.filter((photo) => !filter_urls.includes(photo.url));
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
