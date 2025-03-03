const mongoose = require("mongoose");

const ClipboardSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now, expires: 600 }, // Auto-delete after 10 mins
  },
  { timestamps: true }
);

module.exports = mongoose.model("Clipboard", ClipboardSchema);
