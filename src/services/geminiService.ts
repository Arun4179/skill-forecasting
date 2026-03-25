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
    // include auth token if available so the protected endpoint will accept the request
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:5000/api/forecast/career-forecast", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(profile),
    });

    if (!response.ok) {
      // if auth failed, clear stored token so UI can redirect
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      const errorData = await response.json().catch(() => ({}));
      // include details field if present
      const serverMsg = errorData?.error;
      const detailMsg = errorData?.details;
      throw new Error(
        serverMsg + (detailMsg ? `: ${detailMsg}` : "") || "Career forecasting request failed"
      );
    }

    let data;
    try {
      data = await response.json();
    } catch (e) {
      throw new Error("Server returned invalid JSON");
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
