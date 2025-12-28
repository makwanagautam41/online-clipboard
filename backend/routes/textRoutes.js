const express = require("express");
const Clipboard = require("../models/Clipboard");
const See = require("../models/See");
const redis = require("../config/redis");

const router = express.Router();

Clipboard.collection.createIndex({ code: 1 }, { unique: true });

const generateCode = async () => {
  let code;
  let exists = true;

  while (exists) {
    code = Math.floor(1000 + Math.random() * 9000).toString();
    exists = await redis.exists(`clipboard:${code}`);
  }

  return code;
};

router.post("/save-text", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Text is required" });

  const code = await generateCode();

  await redis.set(`clipboard:${code}`, text, "EX", 900);

  Clipboard.create({ text, code }).catch(() => {});

  res.json({ message: "Text saved successfully", code });
});

router.get("/retrieve-text/:code", async (req, res) => {
  const { code } = req.params;

  const cached = await redis.get(`clipboard:${code}`);
  if (cached) return res.json({ text: cached });

  const clip = await Clipboard.findOne({ code }).lean();
  if (!clip) return res.status(404).json({ error: "Invalid or expired code" });

  await redis.set(`clipboard:${code}`, clip.text, "EX", 900);

  res.json({ text: clip.text });
});

router.post("/save-long-data", async (req, res) => {
  const { text, label } = req.body;
  if (!text || !label)
    return res.status(400).json({ error: "Text and Label required" });

  await redis.set(`long:${label}`, text);

  See.create({ text, label }).catch(() => {});

  res.json({ message: "Text Saved Successfully" });
});

router.get("/get-long-data", async (req, res) => {
  const { label } = req.query;
  if (!label) return res.status(400).json({ error: "Label is required" });

  const cached = await redis.get(`long:${label}`);
  if (cached) return res.json({ data: cached });

  const data = await See.findOne({ label }).select("text").lean();
  if (!data) return res.status(404).json({ error: "No data found" });

  await redis.set(`long:${label}`, data.text);

  res.json({ data: data.text });
});

module.exports = router;
