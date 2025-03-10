import React, { useEffect, useState } from "react";
import { retrieveExpiredImages, deleteAllExpiredImages } from "../api";

const ExpiredImages = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch Expired Images
  const fetchExpiredImages = async () => {
    setLoading(true);
    try {
      const expiredImages = await retrieveExpiredImages();
      setImages(expiredImages);
    } catch (error) {
      console.error("Error fetching expired images:", error);
    }
    setLoading(false);
  };

  // Delete All Expired Images
  const deleteAllImages = async () => {
    setDeleting(true);
    try {
      await deleteAllExpiredImages();
      setImages([]); // Clear state after deletion
    } catch (error) {
      console.error("Error deleting images:", error);
    }
    setDeleting(false);
  };

  useEffect(() => {
    fetchExpiredImages();
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Expired Images</h2>

      {images.length > 0 && (
        <button
          onClick={deleteAllImages}
          disabled={deleting}
          style={{
            marginBottom: "20px",
            padding: "10px 20px",
            backgroundColor: "red",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {deleting ? "Deleting..." : "Delete All"}
        </button>
      )}

      {loading ? (
        <p>Loading images...</p>
      ) : images.length === 0 ? (
        <p>No expired images found</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "10px",
          }}
        >
          {images.map((image) => (
            <div
              key={image._id}
              style={{
                border: "1px solid #ddd",
                padding: "5px",
                borderRadius: "8px",
                backgroundColor: "#f9f9f9",
              }}
            >
              <img
                src={image.imageUrl}
                alt="Expired"
                style={{
                  width: "100px",
                  height: "100px", 
                  objectFit: "cover",
                  borderRadius: "5px",
                  display: "block",
                  margin: "auto",
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpiredImages;
