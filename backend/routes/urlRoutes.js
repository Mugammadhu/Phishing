const express = require("express");
const axios = require("axios");
const URL = require("../models/URL.js");

const router = express.Router();

// Check if URL is phishing
router.post("/check-url", async (req, res) => {
  const { url } = req.body;

  try {
    // Call ML API
    const response = await axios.post(`${process.env.PHISHING_URL}/predict`, { url });
    const { isSafe, confidence } = response.data;

    // Save result in MongoDB
    const newURL = new URL({ url, isSafe, confidence });
    await newURL.save();

    res.json({ url, isSafe, confidence });
  } catch (error) {
    res.status(500).json({ message: "Error processing URL", error: error.message });
  }
});

module.exports= router;

