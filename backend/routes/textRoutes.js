const express = require("express");
const Clipboard = require("../models/Clipboard");
const router = express.Router();

// Generate Unique 4-digit Code
const generateUniqueCode = async () => {
  let code, exists;
  do {
    code = Math.floor(1000 + Math.random() * 9000).toString();
    exists = await Clipboard.exists({ code });
  } while (exists);
  return code;
};

// Save Clipboard Text
router.post("/save-text", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Text is required" });

  const code = await generateUniqueCode();
  await Clipboard.create({ text, code });

  res.json({ message: "Text saved successfully", code });
});

// Retrieve Clipboard Text
router.get("/retrieve-text/:code", async (req, res) => {
  const { code } = req.params;
  const clip = await Clipboard.findOne({ code });

  if (!clip) return res.status(404).json({ error: "Invalid or expired code" });

  res.json({ text: clip.text });
});

module.exports = router;
