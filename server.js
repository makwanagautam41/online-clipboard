const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const cron = require("node-cron");
require("dotenv").config();

const textRoutes = require("./routes/textRoutes");
const imageRoutes = require("./routes/imageRoutes"); // Add image routes
const Clipboard = require("./models/Clipboard");
const ImageClipboard = require("./models/ImageClipboard"); // Add image model

const app = express();

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("Database Connection Error:", err));

// Middleware temp
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Use Routes
app.use("/", textRoutes);
app.use("/", imageRoutes); // Add image routes

// Automatically delete old clipboard data (Text & Images) every 10 minutes
cron.schedule("*/10 * * * *", async () => {
  const expirationTime = new Date(Date.now() - 10 * 60 * 1000);

  await Clipboard.deleteMany({ createdAt: { $lt: expirationTime } });
  await ImageClipboard.deleteMany({ createdAt: { $lt: expirationTime } });

  console.log("Old clipboard text and images deleted");
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT} [http://localhost:${PORT}]`)
);
