const mongoose = require("mongoose");

const ImageClipboardSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true }, // Cloudinary URL
  code: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now, expires: 600 }, // Auto delete after 10 min
});

module.exports = mongoose.model("ImageClipboard", ImageClipboardSchema);
