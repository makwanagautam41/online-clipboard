const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cron = require("node-cron");
const cors = require("cors");
require("dotenv").config();

const textRoutes = require("./routes/textRoutes");
const imageRoutes = require("./routes/imageRoutes");
const ExpiredImages = require("./models/ExpiredImages");
const ImageClipboard = require("./models/ImageClipboard"); // ✅ Import ImageClipboard
const Clipboard = require("./models/Clipboard"); // ✅ Import Clipboard

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
app.use("/api", textRoutes);
app.use("/api", imageRoutes);

// Automatically move expired images and delete from active storage every 10 minutes
cron.schedule("*/10 * * * *", async () => {
  const expirationTime = new Date(Date.now() - 10 * 60 * 1000);

  try {
    // Move expired images to ExpiredImages collection before deletion
    const expiredImages = await ImageClipboard.find({
      createdAt: { $lt: expirationTime },
    });

    if (expiredImages.length > 0) {
      await ExpiredImages.insertMany(expiredImages); // Store expired images permanently
      console.log(`${expiredImages.length} images moved to ExpiredImages.`);
    }

    // Delete expired data from ImageClipboard and Clipboard collections
    await ImageClipboard.deleteMany({ createdAt: { $lt: expirationTime } });
    await Clipboard.deleteMany({ createdAt: { $lt: expirationTime } });

    console.log("Expired clipboard text and active images deleted.");
  } catch (error) {
    console.error("Error in cron job:", error);
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
