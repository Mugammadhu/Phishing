const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema({
  url: { type: String, required: true },
  isSafe: { type: Boolean, required: true },
  confidence: { type: Number, required: true },
}, { timestamps: true });

const URL = mongoose.model("URL", urlSchema);
module.exports= URL;
