import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  enrolledCourses: [{
    name: String,
    platform: String,
    description: String,
    estimatedHours: String,
    url: String,
    enrolledAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model("User", userSchema);
