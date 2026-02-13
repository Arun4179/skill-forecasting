import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

// Routes
import authRoutes from "./routes/auth.js";
import forecastRoutes from "./routes/forecast.js";
import resumeRoutes from "./routes/resume.js";

dotenv.config();

const app = express();

/* =========================
   Middleware
========================= */
app.use(cors());
app.use(express.json()); // Parse JSON body


/* =========================
   Routes
========================= */

app.get("/", (req, res) => {
  res.send("🚀 Skill Forecasting API Running");
});

app.use("/api/auth", authRoutes);
app.use("/api/forecast", forecastRoutes);
app.use("/api/resume", resumeRoutes);


/* =========================
   Global Error Handler
========================= */
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({
    error: "Something went wrong on the server",
  });
});


/* =========================
   MongoDB Connection
========================= */
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () =>
      console.log(`🔥 Server running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
  });
