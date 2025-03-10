const mongoose = require("mongoose");

const expiredImageSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  code: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ExpiredImages", expiredImageSchema);
