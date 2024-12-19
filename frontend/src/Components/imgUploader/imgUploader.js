import axios from "axios";
import React, { useEffect, useState } from "react";
import "./ImageUploader.css"; // Add CSS for styling

function ImgUploader() {
  const [image, setImage] = useState(null);
  const [allImages, setAllImages] = useState([]);

  const submitImg = async (e) => {
    e.preventDefault();

    if (!image) {
      alert("Please select an image to upload.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", image);

      await axios.post("http://localhost:5000/uploadImg", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Image uploaded successfully!");
      setImage(null); // Reset input
      getImage(); // Refresh image list
    } catch (err) {
      console.error("Error uploading image:", err.message);
      alert("Failed to upload the image. Please try again.");
    }
  };

  const onImgChange = (e) => {
    setImage(e.target.files[0]);
  };

  const getImage = async () => {
    try {
      const result = await axios.get("http://localhost:5000/getImage");
      setAllImages(result.data.data || []);
    } catch (err) {
      console.error("Error fetching images:", err.message);
      alert("Failed to fetch images. Please try again.");
    }
  };

  useEffect(() => {
    getImage();
  }, []);

  return (
    <div>
      <h1>🥙Upload Your MEAL!🌮</h1>
      <form onSubmit={submitImg}>
        <input type="file" accept="image/*" onChange={onImgChange} />
        <button type="submit" disabled={!image}>
          Upload
        </button>
      </form>

      {/* Image display section */}
      <div className="image-container">
        {allImages.length === 0 ? (
          <p>No images available.</p>
        ) : (
          allImages.map((data) => {
            const imageUrl = `http://localhost:5000/images/${data.Image}`;
            return (
              <img
                key={data._id}
                src={imageUrl}
                alt="Uploaded"
                className="uploaded-image"
              />
            );
          })
        )}
      </div>
    </div>
  );
}

export default ImgUploader;
