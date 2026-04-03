// src/services/geminiService.tsx
import api from "./api";

export interface UserProfile {
  currentRole: string;
  skills: string[];
  interests: string[];
  experienceLevel: string;
}

export interface CareerRecommendation {
  title: string;
  description: string;
  relevanceScore: number;
  growthForecast: string;
  averageSalary: string;
  keySkills: {
    name: string;
    category: string;
    demandScore: number;
  }[];
  learningPath: string[];
}

export const getCareerIntelligence = async (
  profile: UserProfile
): Promise<CareerRecommendation[]> => {
  try {
    const response = await api.post("/api/forecast/career-forecast", profile);
    const data = response.data;

    if (response.status >= 400) {
      // if auth failed, clear stored token so UI can redirect
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      const errorData = response.data;
      // include details field if present
      const serverMsg = errorData?.error;
      const detailMsg = errorData?.details;
      throw new Error(
        serverMsg + (detailMsg ? `: ${detailMsg}` : "") || "Career forecasting request failed"
      );
    }

    if (!Array.isArray(data)) {
      throw new Error("Invalid response format from server");
    }

    return data;

  } catch (error: any) {
    console.error("Career Forecasting Error:", error.message);
    throw new Error(
      error?.message || "Unable to generate career recommendations"
    );
  }
};
