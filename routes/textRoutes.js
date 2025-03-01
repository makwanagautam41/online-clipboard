const express = require("express");
const Clipboard = require("../models/Clipboard");

const router = express.Router();

// Generate Unique 4-digit Code
const generateUniqueCode = async () => {
  let code;
  let exists = true;

  while (exists) {
    code = Math.floor(1000 + Math.random() * 9000).toString();
    exists = await Clipboard.exists({ code });
  }

  return code;
};

// Render Home Page
router.get("/", (req, res) => {
  res.render("index", {
    message: null,
    messageType: null,
    retrievedText: null,
  });
});

// Save Clipboard Text
router.post("/save", async (req, res) => {
  const { text } = req.body;
  if (text) {
    const code = await generateUniqueCode(); // Ensure unique code
    await Clipboard.create({ text, code });
    res.render("index", {
      message: `Your code: ${code}`,
      messageType: "success",
      retrievedText: null,
    });
  } else {
    res.render("index", {
      message: "Error: No text provided!",
      messageType: "error",
      retrievedText: null,
    });
  }
});

// Retrieve Clipboard Text
router.post("/retrieve", async (req, res) => {
  const { code } = req.body;
  const clip = await Clipboard.findOne({ code });

  if (clip) {
    res.render("index", {
      message: null,
      messageType: null,
      retrievedText: clip.text,
    });
  } else {
    res.render("index", {
      message: "Invalid Code or Expired Data!",
      messageType: "error",
      retrievedText: null,
    });
  }
});

module.exports = router;
