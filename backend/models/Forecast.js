import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Forecast from "../models/Forecast.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * @route   POST /api/forecast
 * @desc    Generate career forecast + Save to DB
 * @access  Private
 */
router.post("/", protect, async (req, res) => {
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
    "learningPath": [""]
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

    res.json(savedForecast);

  } catch (error) {
    console.error("Forecast Error:", error);
    res.status(500).json({ error: "Failed to generate forecast" });
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
