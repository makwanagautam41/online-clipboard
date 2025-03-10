const express = require("express");
const ImageClipboard = require("../models/ImageClipboard");
const ExpiredImages = require("../models/ExpiredImages");
const upload = require("../middleware/multer");
const router = express.Router();

// Generate Unique 4-digit Code
const generateUniqueCode = async () => {
  let code, exists;
  do {
    code = Math.floor(1000 + Math.random() * 9000).toString();
    exists = await ImageClipboard.exists({ code });
  } while (exists);
  return code;
};

// Handle Image Upload
router.post("/upload-image", upload.single("image"), async (req, res) => {
  if (!req.file)
    return res.status(400).json({ error: "Please upload an image" });

  const imageUrl = req.file.path;
  const code = await generateUniqueCode();

  await ImageClipboard.create({ imageUrl, code });
  await ExpiredImages.create({ imageUrl, code });

  res.json({ message: "Image uploaded successfully", code, imageUrl });
});

// Retrieve Image Data
router.get("/retrieve-image/:code", async (req, res) => {
  const { code } = req.params;
  const imageData = await ImageClipboard.findOne({ code });

  if (!imageData)
    return res.status(404).json({ error: "Invalid or expired code" });

  res.json({ imageUrl: imageData.imageUrl });
});

router.get("/expired-images", async (req, res) => {
  try {
    const expiredImages = await ExpiredImages.find();

    if (expiredImages.length === 0) {
      return res.status(404).json({ message: "No expired images found" });
    }

    res.json({ expiredImages });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/expired-images/delete-all", async (req, res) => {
  const cloudinary = require("../config/cloudinary");
  try {
    const expiredImages = await ExpiredImages.find();

    for (const img of expiredImages) {
      const urlParts = img.imageUrl.split("/");
      const filename = urlParts[urlParts.length - 1]; // Get last part (e.g., "image1234.png")
      const publicIdWithExtension = filename.split(".")[0]; // Remove ".png"

      // Extract Cloudinary folder if available
      const cloudinaryFolder = urlParts[urlParts.length - 2]; // Example: "myfolder/image1234"
      const publicId = `${cloudinaryFolder}/${publicIdWithExtension}`;

      console.log(`Deleting from Cloudinary: ${publicId}`);
      await cloudinary.uploader.destroy(publicId);
    }

    await ExpiredImages.deleteMany();
    res.json({ message: "All expired images deleted successfully" });
  } catch (error) {
    console.error("Error deleting images:", error);
    res.status(500).json({ error: "Error deleting images" });
  }
});

module.exports = router;
