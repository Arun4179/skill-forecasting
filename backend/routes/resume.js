    import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Forecast from "../models/Forecast.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * @route   POST /api/resume/analyze
 * @desc    Analyze resume and generate career forecast
 * @access  Private
 */
router.post("/analyze", protect, async (req, res) => {
  try {
    const { resumeText } = req.body;

    if (!resumeText) {
      return res.status(400).json({ error: "Resume text is required" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
Return ONLY valid JSON.

Analyze this resume:

${resumeText}

Step 1: Extract:
{
  "currentRole": "",
  "skills": [],
  "experienceLevel": "",
  "industries": []
}

Step 2: Based on extracted data, generate 3 future-proof career paths in this format:

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

Final output format:

{
  "extractedProfile": { ... },
  "recommendations": [ ... ]
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    // Save to database
    const savedForecast = await Forecast.create({
      userId: req.user.id,
      profile: parsed.extractedProfile,
      recommendations: parsed.recommendations,
      source: "resume",
    });

    res.json(savedForecast);

  } catch (error) {
    console.error("Resume Analysis Error:", error);
    res.status(500).json({ error: "Failed to analyze resume" });
  }
});

export default router;
