const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema({
  skills: [String],
  score: Number,
  suggestions: [String],
  summary: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Resume", resumeSchema);