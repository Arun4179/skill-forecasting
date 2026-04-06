export interface Skill {
  name: string;
  category: 'technical' | 'soft' | 'emerging';
  demandScore: number; // 0-100
}

export interface Course {
  name: string;
  platform: string;
  description: string;
  estimatedHours: string;
  url?: string;
}

export interface CourseModule {
  _id: string;
  title: string;
  content: string;
  isCompleted: boolean;
}

export interface EnrolledCourse {
  _id: string;
  name: string;
  platform: string;
  description: string;
  estimatedHours: string;
  modules: CourseModule[];
  progress: number;
}

export interface CareerRecommendation {
  title: string;
  description: string;
  relevanceScore: number;
  growthForecast: string;
  keySkills: Skill[];
  learningPath: string[];
  averageSalary: string;
  suggestedCourses?: Course[];
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
