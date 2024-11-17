"use client";
import Link from 'next/link';
import PhotoFeed from '../components/PhotoFeed';
import SearchBar from '../components/SearchBar';
import { useState } from 'react';

export default function Home() {

  const [filteredPhotos, setFilteredPhotos] = useState<string[]>([]); // Store filtered S3 locations

  const handleSearch = async (query: string) => {
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Set the returned array of S3 locations directly to state
      const results: string[] = await response.json();
      setFilteredPhotos(results);
      console.log("Filtered photos:", results);
    } catch (error) {
      console.log("Error fetching search results:", error);
    }
  };

  return (
    <div className="flex min-h-screen">
        <div className="sidebar w-64 p-4 font-serif">
          <a href="#events" className="sidebar-link active">Events</a>
          <div className="event-buttons">
            <a href="#workshop" className="event-button">Workshop</a>
            <a href="#hackathon" className="event-button">Hackathon</a>
            <a href="#meeting" className="event-button">Meeting</a>
          </div>
          <a href="#createEvent" className="sidebar-link active">Create New Event</a>
        </div>
  
    <div style={{ padding: "2rem" }}>
      <h1>SCU Photo Gallery</h1>

      {/* Search Bar */}
      <SearchBar onSearch={handleSearch} />

      {/* Pass filtered S3 locations to PhotoFeed */}
      <PhotoFeed s3Locations={filteredPhotos} />
    </div>
  </div>
  );
}
