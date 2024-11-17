"use client";

import { useEffect, useState } from "react";

interface Photo {
  key: string; // Unique identifier for the photo
  url: string; // URL for the photo
}

const PhotoFeed: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch photos on component mount
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch("/api/photos");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: Photo[] = await response.json();
        console.error(data);
        setPhotos(data);
      } catch (err) {
        setError("Failed to load photos. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

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
        <div key={photo.key} className="photo-item"> {/* Use the unique `key` */}
          <img src={photo.url} alt={photo.key} onError={() => console.error("Image failed to load:", photo.url)} />
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
