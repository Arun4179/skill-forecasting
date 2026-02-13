// src/services/geminiService.tsx

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
    const response = await fetch("http://localhost:5000/career-forecast", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profile),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData?.error || "Career forecasting request failed"
      );
    }

    const data = await response.json();

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
