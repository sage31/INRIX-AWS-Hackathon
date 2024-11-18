import React, { useState } from "react";
import axios from "axios";

interface FileUploadPopupProps {
  onClose: () => void; // Function to close the popup
}

const FileUploadPopup: React.FC<FileUploadPopupProps> = ({ onClose }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles([...files, ...Array.from(event.target.files)]);
    }
  };

  // Remove a file from the list
  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  // Handle file upload
  const handleUpload = async () => {
    if (files.length === 0) {
      setMessage("Please add files to upload.");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      for (const file of files) {
        // Request a pre-signed URL from the backend with ACL
        const { data } = await axios.post("/api/upload-url", {
          filename: file.name,
          filetype: file.type,
          acl: "public-read", // Pass ACL to the backend
        });

        const { uploadUrl } = data;

        // Upload the file to S3
        await axios.put(uploadUrl, file, {
          headers: {
            "Content-Type": file.type,
          },
        });
      }

      setMessage("All files uploaded successfully!");
      setFiles([]); // Clear the file list after upload
    } catch (error) {
      console.error("Error uploading files:", error);
      setMessage("Failed to upload some files.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "black"
      }}
    >
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "8px",
          width: "400px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
          color: "black"
        }}
      >
        <h3>Upload Files</h3>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          style={{ marginBottom: "10px" }}
        />
        <ul>
          {files.map((file, index) => (
            <li key={index} style={{ marginBottom: "5px" }}>
              {file.name}{" "}
              <button
                onClick={() => removeFile(index)}
                style={{
                  marginLeft: "10px",
                  color: "red",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        <button
          onClick={handleUpload}
          disabled={uploading}
          style={{
            background: "blue",
            color: "white",
            padding: "10px 15px",
            borderRadius: "5px",
            border: "none",
            cursor: uploading ? "not-allowed" : "pointer",
            marginRight: "10px",
            
          }}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
        <button
          onClick={onClose}
          style={{
            background: "gray",
            color: "white",
            padding: "10px 15px",
            borderRadius: "5px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Close
        </button>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default FileUploadPopup;
