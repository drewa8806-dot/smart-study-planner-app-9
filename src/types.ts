export interface Exam {
  id: string;
  subject: string;
  date: string;
  priority: 'high' | 'medium' | 'low';
}

export interface StudySession {
  id: string;
  examId: string;
  subject: string;
  date: string;
  duration: number; // in minutes
  breakDuration: number; // in minutes
  completed: boolean;
  intensity?: 'high' | 'medium' | 'light' | 'rest';
}

export interface TimerState {
  minutes: number;
  seconds: number;
  isActive: boolean;
  isBreak: boolean;
}
