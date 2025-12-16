import { Timestamp } from 'firebase/firestore';
import { TaskCategory, UrgencyLevel } from './task';

export interface CompletionSpeedData {
  avgDays: number;
  count: number;
  stdDev?: number; // standard deviation
}

export interface TimePreference {
  morning: number; // 0-1 score (0 = never, 1 = always)
  afternoon: number;
  evening: number;
  night: number;
}

export interface DueProximityData {
  avgDaysBeforeDue: number; // when user typically acts relative to due date
  count: number;
}

export interface UrgencyPatternData {
  completionSpeed: {
    critical: CompletionSpeedData;
    high: CompletionSpeedData;
    medium: CompletionSpeedData;
    low: CompletionSpeedData;
  };
  timePreferences: TimePreference;
  urgentKeywords: Record<string, number>; // keyword -> urgency score (0-1)
  dueProximity: {
    critical: DueProximityData;
    high: DueProximityData;
    medium: DueProximityData;
    low: DueProximityData;
  };
}

export interface UrgencyPattern {
  patternId: string;
  userId: string;
  category: TaskCategory;
  patterns: UrgencyPatternData;
  lastUpdated: Date;
  sampleSize: number; // number of completed tasks analyzed
  confidence: number; // 0-1, based on sample size
}

export interface UrgencyPatternDocument {
  patternId: string;
  userId: string;
  category: TaskCategory;
  patterns: UrgencyPatternData;
  lastUpdated: Timestamp;
  sampleSize: number;
  confidence: number;
}

export interface UrgencySuggestion {
  suggestedUrgency: UrgencyLevel;
  confidence: number; // 0-1
  reasoning: string; // explanation for the suggestion
  factors: {
    keywordScore: number;
    dueDateScore: number;
    categoryScore: number;
  };
}

export interface TaskCompletionData {
  taskId: string;
  userId: string;
  category: TaskCategory;
  urgency: UrgencyLevel;
  timeToCompletion: number; // days
  keywords: string[];
  completedAt: Date;
  dueDate?: Date;
  daysBeforeDue?: number; // negative if overdue
}
