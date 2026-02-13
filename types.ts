
export interface Skill {
  name: string;
  category: 'technical' | 'soft' | 'emerging';
  demandScore: number; // 0-100
}

export interface CareerRecommendation {
  title: string;
  description: string;
  relevanceScore: number;
  growthForecast: string;
  keySkills: Skill[];
  learningPath: string[];
  averageSalary: string;
  marketTrendSource?: {
    title: string;
    uri: string;
  }[];
}

export interface UserProfile {
  currentRole: string;
  skills: string[];
  interests: string[];
  experienceLevel: 'entry' | 'mid' | 'senior';
}

export interface AssessmentState {
  step: number;
  profile: UserProfile;
  loading: boolean;
  recommendations: CareerRecommendation[];
  error: string | null;
}
