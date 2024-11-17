import React from "react";

interface PopupProps {
  onClose: () => void;
}

export const Popup: React.FC<PopupProps> = ({ onClose }) => {
   return (
     <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
       <div className="bg-white p-6 rounded shadow-lg w-80">
         <h2 className="text-lg font-bold mb-4">Add New Club</h2>
         <input
           type="text"
           placeholder="Enter club name"
           className="w-full p-2 border rounded mb-4 text-red-900"
         />
         <div className="flex justify-end gap-2">
           <button
             onClick={onClose}
             className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
           >
             Close
           </button>
         </div>
       </div>
     </div>
   );
 };
 
 //export default Popup;