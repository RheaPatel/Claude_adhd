import { Timestamp } from 'firebase/firestore';

export type TaskCategory = 'work' | 'personal' | 'health' | 'shopping' | 'social' | 'other';

export type UrgencyLevel = 'critical' | 'high' | 'medium' | 'low';

export type UrgencySource = 'user' | 'suggested' | 'learned';

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'archived';

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'custom';

export interface Subtask {
  subtaskId: string;
  title: string;
  completed: boolean;
  completedAt?: Date;
  createdAt: Date;
}

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval: number; // e.g., every 2 days, every 3 weeks
  daysOfWeek?: number[]; // 0-6 for Sunday-Saturday
  endDate?: Date;
  occurrences?: number; // Stop after X occurrences
}

export interface Task {
  taskId: string;
  userId: string;
  title: string;
  description?: string;
  category: TaskCategory;
  categoryConfidence?: number;
  urgency: UrgencyLevel;
  urgencySource: UrgencySource;
  suggestedUrgency?: UrgencyLevel;
  dueDate?: Date;
  reminderTimes?: Date[];
  status: TaskStatus;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  isLongTerm?: boolean; // Flag for long-term tasks

  // Subtasks
  subtasks?: Subtask[];

  // Recurrence
  isRecurring?: boolean;
  recurrenceRule?: RecurrenceRule;
  parentRecurringTaskId?: string; // For instances created from recurring tasks

  // Templates
  isTemplate?: boolean;
  templateId?: string; // ID if created from template

  // Learning metadata
  estimatedDuration?: number; // in minutes
  actualDuration?: number; // in minutes
  timeToCompletion?: number; // in days from creation to completion

  // Contextual triggers
  contextualEventId?: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  category?: TaskCategory;
  urgency?: UrgencyLevel;
  dueDate?: Date;
  reminderTimes?: Date[];
  tags?: string[];
  isLongTerm?: boolean;
  subtasks?: Subtask[];
  isRecurring?: boolean;
  recurrenceRule?: RecurrenceRule;
  templateId?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  category?: TaskCategory;
  urgency?: UrgencyLevel;
  urgencySource?: UrgencySource;
  dueDate?: Date;
  reminderTimes?: Date[];
  status?: TaskStatus;
  tags?: string[];
  actualDuration?: number;
  isLongTerm?: boolean;
  subtasks?: Subtask[];
  isRecurring?: boolean;
  recurrenceRule?: RecurrenceRule;
}

export interface TaskFilters {
  category?: TaskCategory;
  urgency?: UrgencyLevel;
  status?: TaskStatus;
  tags?: string[];
  search?: string;
}

export interface TaskSortOption {
  field: 'createdAt' | 'updatedAt' | 'dueDate' | 'urgency' | 'title';
  direction: 'asc' | 'desc';
}

// Firestore document type (for reading from database)
export interface SubtaskDocument {
  subtaskId: string;
  title: string;
  completed: boolean;
  completedAt?: Timestamp;
  createdAt: Timestamp;
}

export interface RecurrenceRuleDocument {
  frequency: RecurrenceFrequency;
  interval: number;
  daysOfWeek?: number[];
  endDate?: Timestamp;
  occurrences?: number;
}

export interface TaskDocument {
  taskId: string;
  userId: string;
  title: string;
  description?: string;
  category: TaskCategory;
  categoryConfidence?: number;
  urgency: UrgencyLevel;
  urgencySource: UrgencySource;
  suggestedUrgency?: UrgencyLevel;
  dueDate?: Timestamp;
  reminderTimes?: Timestamp[];
  status: TaskStatus;
  completedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  tags?: string[];
  isLongTerm?: boolean;
  subtasks?: SubtaskDocument[];
  isRecurring?: boolean;
  recurrenceRule?: RecurrenceRuleDocument;
  parentRecurringTaskId?: string;
  isTemplate?: boolean;
  templateId?: string;
  estimatedDuration?: number;
  actualDuration?: number;
  timeToCompletion?: number;
  contextualEventId?: string;
}
