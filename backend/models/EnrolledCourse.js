import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema({
  title: String,
  content: String,
  isCompleted: { type: Boolean, default: false }
});

const enrolledCourseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  platform: String,
  description: String,
  estimatedHours: String,
  url: String, // Keep the generated search url just in case
  modules: [moduleSchema],
  progress: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model("EnrolledCourse", enrolledCourseSchema);
