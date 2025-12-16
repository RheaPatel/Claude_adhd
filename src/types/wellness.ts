import { Timestamp } from 'firebase/firestore';

export type WellnessCheckInType = 'hydration' | 'meal' | 'break' | 'medication' | 'mood' | 'energy' | 'custom';

export interface WellnessCheckInLog {
  checkInId: string;
  userId: string;
  type: WellnessCheckInType;
  timestamp: Date;
  mood?: number; // 1-5 scale
  energy?: number; // 1-5 scale
  notes?: string;
  tags?: string[];
  createdAt: Date;
}

export interface WellnessCheckInLogDocument {
  checkInId: string;
  userId: string;
  type: WellnessCheckInType;
  timestamp: Timestamp;
  mood?: number;
  energy?: number;
  notes?: string;
  tags?: string[];
  createdAt: Timestamp;
}

export interface WellnessStats {
  userId: string;
  date: Date; // Day for these stats
  hydrationCount: number;
  mealCount: number;
  breakCount: number;
  averageMood?: number;
  averageEnergy?: number;
  totalCheckIns: number;
}

export interface WellnessStatsDocument {
  userId: string;
  date: Timestamp;
  hydrationCount: number;
  mealCount: number;
  breakCount: number;
  averageMood?: number;
  averageEnergy?: number;
  totalCheckIns: number;
}

export interface DailyWellnessSummary {
  date: Date;
  hydrationGoal: number;
  hydrationCompleted: number;
  mealsGoal: number;
  mealsCompleted: number;
  breaksGoal: number;
  breaksCompleted: number;
  averageMood?: number;
  averageEnergy?: number;
  insights?: string[];
}

export interface WellnessGoals {
  dailyHydration: number;
  dailyMeals: number;
  breakFrequency: number; // in minutes
}
