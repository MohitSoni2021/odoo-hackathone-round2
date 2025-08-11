import React, { useState } from "react";

const ImageUpload = () => {
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!imageFile) return alert("Please select an image first!");

    setLoading(true);

    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append(
      "upload_preset",
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
    );

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        }/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      setUploadedUrl(data.secure_url);
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Image upload failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Upload Image to Cloudinary</h2>

      {/* File Input */}
      <input type="file" accept="image/*" onChange={handleFileChange} />

      {/* Preview Section */}
      {previewUrl && (
        <div style={{ marginTop: "20px" }}>
          <h4>Preview:</h4>
          <img
            src={previewUrl}
            alt="Preview"
            style={{ width: "200px", borderRadius: "8px" }}
          />
        </div>
      )}

      {/* Upload Button */}
      <div style={{ marginTop: "20px" }}>
        <button onClick={handleUpload} disabled={loading}>
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {/* Uploaded Image Link */}
      {uploadedUrl && (
        <div style={{ marginTop: "20px" }}>
          <h4>Uploaded Image:</h4>
          <a href={uploadedUrl} target="_blank" rel="noopener noreferrer">
            {uploadedUrl}
          </a>
          <div>
            <img
              src={uploadedUrl}
              alt="Uploaded"
              style={{ width: "200px", borderRadius: "8px", marginTop: "10px" }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
