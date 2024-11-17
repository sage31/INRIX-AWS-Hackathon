"use client";
import { useState } from "react";
import Link from 'next/link'
import {Popup}  from "../../components/popup/popup";

export default function Home() {
  const [showPopup, setShowPopup] = useState(false);

  const addClubPopup = () => {
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };
  return (
    <div className="flex">
      <div className="sidebar p-4 font-serif">
        <Link href="/club" className="sidebar-link active">My Clubs</Link>
        <div className="submenu p-4 font-serif">
          <a href="#option" className="submenu-link">ACM</a>
          <a href="#option2" className="submenu-link">SWE</a>
        </div>
        <a href="#option3" className="sidebar-link active mb-4">Other Clubs</a>
        <button
          onClick={addClubPopup}
          className="sidebar-link active mb-4">Add Club</button>
        <Link href="/" className="sidebar-link active">
          Login
        </Link>
      </div>

      <div className="flex-1 p-4 font-serif flex flex-col items-center mt-8">
        <header className="mb-4 text-center">
          <h1 className="text-6xl font-bold">Scrapbook</h1>
          <Link href="/profile">
          <button className="user-profile absolute top-4 right-4">Profile</button>
          </Link>
        </header>
        
        <div className="search-bar my-4 font-serif flex justify-center w-full">
          <input
            type="text"
            placeholder="Search for clubs or photos..."
            className="w-full max-w-xl p-2 rounded-lg border text-red-900"
          />
        </div>

        <div className= "cards mt-8 w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-center">
            <div className="club-cards p-4 bg-white rounded-md shadlow-lg cursor-pointer">
              <h2 className = "text-m font-semibold text-red-900">ACM</h2>
            </div>

            <div className="club-cards p-4 bg-white rounded-md shadlow-lg cursor-pointer">
              <h2 className = "text-m font-semibold text-red-900">SWE</h2>
            </div>

            <div className="club-cards p-4 bg-white rounded-md shadlow-lg cursor-pointer">
              <h2 className = "text-m font-semibold text-red-900">ACM-W</h2>
            </div>

            <div className="club-cards p-4 bg-white rounded-md shadlow-lg cursor-pointer">
              <h2 className = "text-m font-semibold text-red-900">SHPE</h2>
            </div>

            <div className="club-cards p-4 bg-white rounded-md shadlow-lg cursor-pointer">
              <h2 className = "text-m font-semibold text-red-900">ITW</h2>
            </div>
            </div>
            {showPopup && <Popup onClose={() => {setShowPopup(false)}}/>}
      </div>
    </div>
  );
}