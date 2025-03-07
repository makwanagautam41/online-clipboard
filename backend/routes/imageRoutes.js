const express = require("express");
const ImageClipboard = require("../models/ImageClipboard");
const upload = require("../middleware/multer");
const router = express.Router();

// In-memory cache for used codes (reduces DB lookups)
const usedCodes = new Set();

const generateUniqueCode = async () => {
  let code;
  do {
    code = Math.floor(1000 + Math.random() * 9000).toString();
  } while (usedCodes.has(code) || (await ImageClipboard.exists({ code })));

  usedCodes.add(code);
  setTimeout(() => usedCodes.delete(code), 600000); // Remove after 10 minutes

  return code;
};

// Handle Image Upload (Optimized)
router.post("/upload-image", upload.single("image"), async (req, res) => {
  if (!req.file)
    return res.status(400).json({ error: "Please upload an image" });

  const imageUrl = req.file.path;
  const code = await generateUniqueCode();

  ImageClipboard.create({ imageUrl, code }) // Non-blocking save
    .then(() =>
      res.json({ message: "Image uploaded successfully", code, imageUrl })
    )
    .catch(() => res.status(500).json({ error: "Failed to save image" }));
});

router.get("/retrieve-image/:code", async (req, res) => {
  const { code } = req.params;
  const imageData = await ImageClipboard.findOne({ code }).lean();

  if (!imageData)
    return res.status(404).json({ error: "Invalid or expired code" });

  res.json({ imageUrl: imageData.imageUrl });
});

module.exports = router;
