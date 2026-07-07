const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdf = require("pdf-parse");
const fs = require("fs");
const mongoose = require("mongoose");
require("dotenv").config();
const Resume = require("./models/Resume");

const app = express();

//console.log(process.env.MONGODB_URI);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
  })
  .catch((err) => {
    console.log("❌ MongoDB Connection Error:", err);
  });

app.use(cors());
app.use(express.json());

// Multer Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Home Route
app.get("/", (req, res) => {
  res.send("AI Resume Analyzer Backend is Running 🚀");
});

// Upload Route
app.post("/upload", upload.single("resume"), async (req, res) => {
  console.log("Upload API Called");

  if (!req.file) {
    return res.status(400).json({
      message: "No file uploaded!",
    });
  }

  try {
    console.log("Inside try block");

    const dataBuffer = fs.readFileSync(req.file.path);
    console.log("File read successfully");

    const pdfData = await pdf(dataBuffer);

    const resumeText = pdfData.text.toLowerCase();

const skills = [
  "html",
  "css",
  "javascript",
  "react",
  "node.js",
  "express",
  "postgresql",
  "git",
  "github",
];

const foundSkills = skills.filter((skill) =>
  resumeText.includes(skill.toLowerCase())
);

const score = foundSkills.length * 10;

    console.log("PDF parsed successfully");
    console.log("Resume Text:");
console.log(pdfData.text);
const suggestions = [];

if (!resumeText.includes("linkedin")) {
  suggestions.push("Add your LinkedIn profile.");
}

if (!resumeText.includes("github")) {
  suggestions.push("Add your GitHub profile.");
}

if (!resumeText.includes("certification")) {
  suggestions.push("Add your Certifications.");
}

if (!resumeText.includes("achievement")) {
  suggestions.push("Add your Achievements.");
}

if (!resumeText.includes("internship")) {
  suggestions.push("Mention your Internship experience.");
}

if (!resumeText.includes("project")) {
  suggestions.push("Add more Projects.");
}

if (score < 80) {
  suggestions.push("Improve your resume by adding more technical skills.");
}
let summary = "";

if (score >= 90) {
  summary = "Excellent Resume! Your resume contains most of the important technical skills.";
} else if (score >= 70) {
  summary = "Good Resume! Add more projects and certifications to improve it.";
} else if (score >= 50) {
  summary = "Average Resume. Improve your skills and add more achievements.";
} else {
  summary = "Your resume needs significant improvement. Add technical skills, projects and certifications.";
}
const newResume = new Resume({
  skills: foundSkills,
  score,
  suggestions,
  summary,
});
console.log("Before Save");

await newResume.save();
console.log("After Save");

console.log("✅ Resume Saved Successfully");


   return res.status(200).json({
  message: "Resume uploaded and analyzed successfully!",
  text: pdfData.text,
  skills: foundSkills,
  score: score,
  suggestions: suggestions,
  summary: summary,

});
  } catch (error) {
    console.error("PDF Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
});

const PORT = 5000;

app.get("/history", async (req, res) => {
  try {
    const resumes = await Resume.find().sort({ createdAt: -1 });

    res.json(resumes);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

app.delete("/history/:id", async (req, res) => {
  try {
    await Resume.findByIdAndDelete(req.params.id);

    res.json({
      message: "Resume deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Delete failed",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});