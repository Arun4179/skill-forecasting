import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import User from "../models/User.js";
import EnrolledCourse from "../models/EnrolledCourse.js";
import { protect } from "../middleware/authMiddleware.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * @route   GET /api/courses
 * @desc    Get user's enrolled courses (summary list)
 * @access  Private
 */
router.get("/", protect, async (req, res) => {
  try {
    const courses = await EnrolledCourse.find({ userId: req.user.id })
      .select("-modules.content") // Don't fetch full markdown for the list
      .sort({ createdAt: -1 });
    
    // We only fetch AI generated courses from the dedicated collection
    res.json(courses);
  } catch (error) {
    console.error("Fetch Courses Error:", error);
    res.status(500).json({ error: "Failed to fetch enrolled courses" });
  }
});

/**
 * @route   GET /api/courses/:id
 * @desc    Get a specific enrolled course in full
 * @access  Private
 */
router.get("/:id", protect, async (req, res) => {
  try {
    const course = await EnrolledCourse.findOne({ _id: req.params.id, userId: req.user.id });
    if (!course) return res.status(404).json({ error: "Course not found" });
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch course details" });
  }
});

/**
 * @route   POST /api/courses/enroll
 * @desc    Enroll in a new course and generate curriculum via Gemini
 * @access  Private
 */
router.post("/enroll", protect, async (req, res) => {
  try {
    const { name, platform, description, estimatedHours, url } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Course name is required to enroll" });
    }

    // Check if already enrolled
    const existing = await EnrolledCourse.findOne({ userId: req.user.id, name });
    if (existing) {
      return res.status(400).json({ error: "You are already enrolled in this course", courseId: existing._id });
    }

    const newCourse = await EnrolledCourse.create({
      userId: req.user.id,
      name,
      platform: platform || "General",
      description: description || "",
      estimatedHours: estimatedHours || "Self-paced",
      url: url || `https://www.google.com/search?q=${encodeURIComponent(name + " " + (platform || "course"))}`,
      modules: [],
      progress: 0
    });

    res.status(201).json(newCourse);
  } catch (error) {
    console.error("Enroll Course Error:", error);
    res.status(500).json({ error: "Failed to enroll in course" });
  }
});

/**
 * @route   PUT /api/courses/:id/modules/:moduleId/complete
 * @desc    Toggle module completion
 */
router.put("/:id/modules/:moduleId/complete", protect, async (req, res) => {
  try {
    const course = await EnrolledCourse.findOne({ _id: req.params.id, userId: req.user.id });
    if (!course) return res.status(404).json({ error: "Course not found" });

    const module = course.modules.id(req.params.moduleId);
    if (!module) return res.status(404).json({ error: "Module not found" });

    module.isCompleted = req.body.isCompleted;

    const completedCount = course.modules.filter(m => m.isCompleted).length;
    course.progress = Math.round((completedCount / course.modules.length) * 100);

    await course.save();
    res.json(course);
  } catch(error) {
    res.status(500).json({ error: "Failed to update module" });
  }
});

export default router;
