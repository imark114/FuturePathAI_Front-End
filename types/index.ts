export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'student' | 'admin';
  is_staff?: boolean;
  is_superuser?: boolean;
}

export interface Career {
  id: string;
  title: string;
  description: string;
  required_skills: string[];
  avg_salary: number;
  growth_outlook: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: {
    code: number;
    message: string;
  };
}

export interface Simulation {
  id: string;
  career_id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
  score?: number;
  feedback?: string;
}

export interface AdvisorSession {
  id: string;
  student_id: string;
  title: string;
  started_at: string;
  messages: AdvisorMessage[];
}

export interface AdvisorMessage {
  id: string;
  role: 'user' | 'advisor';
  content: string;
  timestamp: string;
}

export interface AnalyticsData {
  readiness_score: number;
  simulations_completed: number;
  career_matches: { career: string; match_percentage: number }[];
}
