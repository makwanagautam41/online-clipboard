const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const Clipboard = require("./models/Clipboard");
const cron = require("node-cron");
require("dotenv").config();

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

// Routes
app.get("/", (req, res) => {
  res.render("index", {
    message: null,
    messageType: null,
    retrievedText: null,
  });
});

app.post("/save", async (req, res) => {
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

app.post("/retrieve", async (req, res) => {
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

// Automatically delete data after 10 minutes
cron.schedule("*/1 * * * *", async () => {
  const expirationTime = new Date(Date.now() - 10 * 60 * 1000);
  await Clipboard.deleteMany({ createdAt: { $lt: expirationTime } });
  console.log("Old data deleted");
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
