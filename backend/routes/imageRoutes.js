const express = require("express");
const ImageClipboard = require("../models/ImageClipboard");
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

module.exports = router;
