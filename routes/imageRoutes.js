const express = require("express");
const ImageClipboard = require("../models/ImageClipboard");
const upload = require("../middleware/multer");
const router = express.Router();

// Function to generate a unique 4-digit code
const generateUniqueCode = async () => {
  let code;
  let existingCode;
  do {
    code = Math.floor(1000 + Math.random() * 9000).toString();
    existingCode = await ImageClipboard.findOne({ code });
  } while (existingCode); // Ensure the code is unique
  return code;
};

// Render Image Page
router.get("/image", (req, res) => {
  res.render("image", {
    message: null,
    messageType: null,
    imageCode: null, // For displaying the generated image code
    retrievedImage: null, // For displaying the retrieved image
  });
});

// Handle image upload
router.post("/upload-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.render("image", {
        message: "Please upload an image.",
        messageType: "error",
        imageCode: null,
        retrievedImage: null,
      });
    }

    const imageUrl = req.file.path; // Cloudinary URL
    const code = await generateUniqueCode(); // Ensure a unique code

    const newImageClipboard = new ImageClipboard({ imageUrl, code });
    await newImageClipboard.save();

    console.log("Image uploaded successfully:", imageUrl, "Code:", code);

    res.render("image", {
      message: `Your Code is ${code}`,
      messageType: "success",
      imageCode: code,
      retrievedImage: null,
    });
  } catch (err) {
    console.error("Upload Error:", err);
    res.render("image", {
      message: "Server Error while uploading image.",
      messageType: "error",
      imageCode: null,
      retrievedImage: null,
    });
  }
});

// Retrieve image data
router.post("/retrieve-image", async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.render("image", {
        message: "Please enter a valid 4-digit code.",
        messageType: "error",
        imageCode: null,
        retrievedImage: null,
      });
    }

    const imageData = await ImageClipboard.findOne({ code });

    if (!imageData) {
      return res.render("image", {
        message: "InValid Code or Image Expired.",
        messageType: "error",
        imageCode: null,
        retrievedImage: null,
      });
    }

    console.log("Image retrieved successfully:", imageData.imageUrl);

    res.render("image", {
      message: "Image retrieved successfully!",
      messageType: "success",
      imageCode: null,
      retrievedImage: imageData,
    });
  } catch (err) {
    console.error("Retrieve Error:", err);
    res.render("image", {
      message: "Server Error while retrieving image.",
      messageType: "error",
      imageCode: null,
      retrievedImage: null,
    });
  }
});

module.exports = router;
