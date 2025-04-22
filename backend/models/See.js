const mongoose = require("mongoose");

const SeeSchema = new mongoose.Schema(
    {
        text: { type: String, required: true },
        label: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }, 
    }
);

module.exports = mongoose.model("See", SeeSchema);
