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

// 404 Route Handler (For Undefined Routes)
app.use((req, res, next) => {
  res.status(404).json({ error: "Route Not Found" });
});

// Cron job to delete expired clipboard data
cron.schedule("*/10 * * * *", async () => {
  const expirationTime = new Date(Date.now() - 10 * 60 * 1000);
  try {
    const expiredImages = await ImageClipboard.find({
      createdAt: { $lt: expirationTime },
    });
    if (expiredImages.length > 0) {
      await ExpiredImages.insertMany(expiredImages);
      console.log(`${expiredImages.length} images moved to ExpiredImages.`);
    }
    await ImageClipboard.deleteMany({ createdAt: { $lt: expirationTime } });
    await Clipboard.deleteMany({ createdAt: { $lt: expirationTime } });
    console.log("Expired clipboard text and active images deleted.");
  } catch (error) {
    console.error("Error in cron job:", error);
  }
});

// Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT} [http://localhost:${PORT}]`)
);
