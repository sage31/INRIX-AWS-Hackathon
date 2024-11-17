import React from "react";

interface PopupProps {
  onClose: () => void;
}

export const Popup: React.FC<PopupProps> = ({ onClose }) => {
  async function onSubmit() {
    // Handle form submission
    const groupNameInput = document.getElementById(
      "groupNameInput"
    ) as HTMLInputElement;
    const groupDescriptionInput = document.getElementById(
      "groupDescriptionInput"
    ) as HTMLInputElement;
    const coverPhoto = await getB64Image(document.getElementById("coverPhoto") as HTMLInputElement);
    const response = await fetch("/api/group", {
      method: "POST",
      body: JSON.stringify({
        name: groupNameInput.value,
        description: groupDescriptionInput.value,
        photo: coverPhoto,
      }),
    });
    if (response.ok) {
      onClose();
      window.location.reload();
    } else {
      console.error("Error creating group");
    }
  }
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-80">
        <h2 className="text-lg font-bold mb-4">Add New Club</h2>
        <input
          type="text"
          id="groupNameInput"
          placeholder="Enter group name"
          className="w-full p-2 border rounded mb-4 text-red-900"
        />
        <input
          type="text"
          id="groupDescriptionInput"
          placeholder="Enter description"
          className="w-full p-2 border rounded mb-4 text-red-900"
        />
        <label
          htmlFor="coverPhoto"
          className="text-sm font-medium text-red-900"
        >
          Upload a Cover Photo
        </label>
        <input
          type="file"
          id="coverPhoto"
          name="coverPhoto"
          accept="image/*"
          required
          className="w-full p-2 border rounded mb-4 text-red-900"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-gray-900 px-4 py-2 p-4 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="bg-red-900 px-4 py-2 p-4 rounded hover:bg-gray-400"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

function getB64Image(fileInput: HTMLInputElement) {
  const file = fileInput.files ? fileInput.files[0] : null; // Get the first file selected
  return new Promise<string>((resolve, reject) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = function () {
        // The result contains the Base64 string
        const base64String = (reader.result as string).split(",")[1]; // Strip off the data URL prefix if needed
        resolve(base64String);
      };
      reader.onerror = function (error) {
        reject("Error reading file");
        console.error("Error reading file:", error);
      };

      reader.readAsDataURL(file as File); // Read the file as a Data URL (includes Base64)
    } else {
      reject("No file selected");
      console.log("No file selected");
    }
  });
}