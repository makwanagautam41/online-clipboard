const express = require("express");
const Clipboard = require("../models/Clipboard");
const See = require("../models/See.js");
const router = express.Router();

// Ensure index on code for faster queries
Clipboard.collection.createIndex({ code: 1 }, { unique: true });

// In-memory cache to reduce redundant DB checks
const usedCodes = new Set();

// Generate Unique 4-digit Code Efficiently
const generateUniqueCode = async () => {
  let code;
  do {
    code = Math.floor(1000 + Math.random() * 9000).toString();
  } while (usedCodes.has(code) || (await Clipboard.exists({ code })));

  usedCodes.add(code);
  setTimeout(() => usedCodes.delete(code), 600000); // Clear cache after 10 mins

  return code;
};

// Save Clipboard Text
router.post("/save-text", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Text is required" });

  const code = await generateUniqueCode();

  Clipboard.create({ text, code }) // Non-blocking save
    .then(() => res.json({ message: "Text saved successfully", code }))
    .catch(() => res.status(500).json({ error: "Failed to save text" }));
});

// Retrieve Clipboard Text
router.get("/retrieve-text/:code", async (req, res) => {
  const { code } = req.params;
  const clip = await Clipboard.findOne({ code }).lean(); 

  if (!clip) return res.status(404).json({ error: "Invalid or expired code" });

  res.json({ text: clip.text });
});

router.post("/save-long-data", async(req,res)=>{
  const {text, label} = req.body;
  if(!text && !label) return res.status(400).json({error:"Text or Label required"});

  See.create({text,label})
    .then(()=> res.json({message:"Text Saved Successfully"}))
    .catch(()=> res.json(500).json({error:"Failed to save text"}))
})

router.get("/get-long-data", async (req, res) => {
  const { label } = req.query;

  if (!label) {
    return res.status(400).json({ error: "Label is required" });
  }

  try {
    const data = await See.findOne({ label }).select('text').lean();

    if (!data) {
      return res.status(404).json({ error: "No data found" });
    }

    return res.json({ data: data.text });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch data" });
  }
});



module.exports = router;
