const mongoose = require("mongoose");

const expiredImageSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true }, // Cloudinary URL
  code: { type: String, required: true, unique: true }, // 4-digit retrieval code
  createdAt: { type: Date, default: Date.now }, // Timestamp (No expiration)
});

module.exports = mongoose.model("ExpiredImages", expiredImageSchema);
