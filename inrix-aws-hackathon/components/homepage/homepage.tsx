
"use client"
import { useState } from "react";
import Link from "next/link";
import React from "react"
import { Popup } from "../popup/popup";
import { close } from "fs";
interface GetUserResponse {
   myGroups: Group[];
   notMyGroups: Group[];
}

interface Group {
   id: string;
   name: string;
   description: string;
   groupPhotoUrl: string;
}

interface HomeProps {
   groups: GetUserResponse
   allGroups: Group[]
}

export const Home: React.FC<HomeProps> = ({ groups, allGroups }) => {
   // UseEffect will only run after the page has loaded

   const [showPopup, setShowPopup] = useState(false);

   const addClubPopup = () => {
      setShowPopup(true);
   };

   const closePopup = () => {
      setShowPopup(false);
   };

   const [isOtherDropdownOpen, setIsOtherDropdownOpen] = useState(false);

   const [isMyDropdownOpen, setIsMyDropdownOpen] = useState(false);

  // Function to toggle the dropdown
  const toggleOtherDropdown = () => {
    setIsOtherDropdownOpen(!isOtherDropdownOpen);
  };

  const toggleMyDropdown = () => {
   setIsMyDropdownOpen(!isMyDropdownOpen);
 };

   return (
      <div className="flex">
         <div className="sidebar p-4 font-serif">
         <button
               onClick={toggleMyDropdown} className="sidebar-link active mb-4">
               My Groups
               <span className={`transform transition-transform ${isMyDropdownOpen ? ' rotate-180' :  ''}`}>
               </span>
            </button>
            {isMyDropdownOpen &&
            <div key={"myGroups"} className="submenu p-4 font-serif">
               {groups!.myGroups.map((group: Group) => (
                  <a href={`/group/${group.id}`} className="submenu-link">
                     <img
                        src={group.groupPhotoUrl}
                        alt={group.name}
                        className="submenu-item-img"/>
                     {group.name}
                  </a>
               ))}
            </div>
            }

            <button
               onClick={toggleOtherDropdown} className="sidebar-link active mb-4">
               Other Groups
               <span className={`transform transition-transform ${isOtherDropdownOpen ? ' rotate-180' :  ''}`}>
               </span>
            </button>
            {isOtherDropdownOpen &&
            <div key={"NotMyGroups"} className="submenu p-4 font-serif">
               {groups!.notMyGroups.map((group: Group) => (
                  <a href={`/group/${group.id}`} className="submenu-link">
                     <img
                        src={group.groupPhotoUrl}
                        alt={group.name}
                        className="submenu-item-img"/>
                     {group.name}
                  </a>
               ))}
            </div>
            }
            <button
               onClick={addClubPopup}
               className="sidebar-link active mb-4">Add Club</button>
         </div>

         <div className="flex-1 p-4 font-serif flex flex-col items-center mt-8">
            <header className="mb-4 text-center">
               <h1 className="text-6xl font-bold">Scrapbook</h1>
               <Link href="/profile">
                  <button className="user-profile absolute top-4 right-4">
                     Profile
                  </button>
               </Link>
            </header>

            <div className="search-bar my-4 font-serif flex justify-center w-full">
               <input
                  type="text"
                  placeholder="Search for clubs or photos..."
                  className="w-full max-w-xl p-2 rounded-lg border text-red-900"
               />
            </div>

            <div className="cards mt-8 w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-center">
               {allGroups.map((group: Group) => (
                  <div
                     key={group.id}
                     className="club-cards p-4 bg-white rounded-md shadow-lg cursor-pointer"
                  >
                     <h2 className="text-m font-semibold text-red-900">
                        {group.name}
                     </h2>
                  </div>
               ))}
            </div>
            {showPopup &&
               <Popup onClose={closePopup}></Popup>
            }
         </div>
      </div>
   );
}
