const mongoose = require("mongoose");

const ImageClipboardSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now, expires: 600 }, // Auto-delete in 10 mins
});

module.exports = mongoose.model("ImageClipboard", ImageClipboardSchema);
