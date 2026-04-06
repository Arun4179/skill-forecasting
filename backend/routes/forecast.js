import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Forecast from "../models/Forecast.js";
import { protect } from "../middleware/authMiddleware.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// ensure developer has provided the API key; otherwise the model call will blow up
if (!process.env.GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not defined; forecast endpoints will fail");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * @route   POST /api/forecast
 * @desc    Generate career forecast + Save to DB
 * @access  Private
 */
router.post("/career-forecast", protect, async (req, res) => {
  try {
    const profile = req.body;

    if (!profile.currentRole || profile.skills.length === 0) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
Return ONLY valid JSON.

User:
Role: ${profile.currentRole}
Skills: ${profile.skills?.join(", ")}
Interests: ${profile.interests?.join(", ")}
Experience: ${profile.experienceLevel}

Return 3 future-proof career paths in this format:

[
  {
    "title": "",
    "description": "",
    "relevanceScore": 0,
    "growthForecast": "",
    "averageSalary": "",
    "keySkills": [
      { "name": "", "category": "", "demandScore": 0 }
    ],
    "learningPath": [""],
    "suggestedCourses": [
      { "name": "", "platform": "", "description": "", "estimatedHours": "", "url": "URL to the course or search link" }
    ]
  }
]
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    // Save forecast to database
    const savedForecast = await Forecast.create({
      userId: req.user.id,
      profile,
      recommendations: parsed,
    });

    res.json(parsed);

  } catch (error) {
    console.error("Forecast Error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: "Failed to generate forecast", details: msg });
  }
});

/**
 * @route   GET /api/forecast/my
 * @desc    Get logged-in user's previous forecasts
 * @access  Private
 */
router.get("/my", protect, async (req, res) => {
  try {
    const forecasts = await Forecast.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json(forecasts);

  } catch (error) {
    console.error("Fetch Forecasts Error:", error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

export default router;
