import mongoose from "mongoose";

const forecastSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    profile: {
      currentRole: String,
      skills: [String],
      interests: [String],
      experienceLevel: String,
    },

    recommendations: [
      {
        title: String,
        description: String,
        relevanceScore: Number,
        growthForecast: String,
        averageSalary: String,
        keySkills: [
          {
            name: String,
            category: String,
            demandScore: Number,
          },
        ],
        learningPath: [String],
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Forecast", forecastSchema);