const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const cron = require("node-cron");
require("dotenv").config();

const textRoutes = require("./routes/textRoutes");
const Clipboard = require("./models/Clipboard");

const app = express();

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("Database Connection Error:", err));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Use Routes
app.use("/", textRoutes);

// Automatically delete old clipboard data every 10 minutes
cron.schedule("*/1 * * * *", async () => {
  const expirationTime = new Date(Date.now() - 10 * 60 * 1000);
  await Clipboard.deleteMany({ createdAt: { $lt: expirationTime } });
  // console.log("Old clipboard data deleted");
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
