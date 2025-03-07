const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cron = require("node-cron");
const cors = require("cors");
require("dotenv").config();

const textRoutes = require("./routes/textRoutes");
const imageRoutes = require("./routes/imageRoutes");
const ExpiredImages = require("./models/ExpiredImages");
const ImageClipboard = require("./models/ImageClipboard");
const Clipboard = require("./models/Clipboard");

const app = express();

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("Database Connection Error:", err));

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

// API Routes
app.get("/", (req, res) => {
  res.send("Server is running!");
});
app.use("/api", textRoutes);
app.use("/api", imageRoutes);
app.use((req, res) => {
  res.status(404).json({ error: "Route Not Found" });
});

// Cron job to delete expired clipboard data
cron.schedule("*/10 * * * *", async () => {
  const expirationTime = new Date(Date.now() - 10 * 60 * 1000);
  try {
    const expiredImages = await ImageClipboard.find({
      createdAt: { $lt: expirationTime },
    });

    for (const image of expiredImages) {
      const publicId = image.imageUrl.split("/").pop().split(".")[0];

      // Delete from Cloudinary
      try {
        await cloudinary.uploader.destroy(`clipboard_uploads/${publicId}`);
        console.log(`Deleted from Cloudinary: ${publicId}`);
      } catch (cloudinaryError) {
        console.error(
          `Cloudinary deletion error for ${publicId}:`,
          cloudinaryError
        );
      }
    }

    // Move expired images to ExpiredImages collection
    if (expiredImages.length > 0) {
      await ExpiredImages.insertMany(expiredImages);
      //console.log(`${expiredImages.length} images moved to ExpiredImages.`);
    }

    await ImageClipboard.deleteMany({ createdAt: { $lt: expirationTime } });
    await Clipboard.deleteMany({ createdAt: { $lt: expirationTime } });
    console.log("Expired clipboard text and images deleted.");
  } catch (error) {
    console.error("Error in cron job:", error);
  }
});

// Export app for Vercel
module.exports = app;
