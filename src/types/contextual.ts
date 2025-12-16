import { Timestamp } from 'firebase/firestore';

export type EventType = 'holiday' | 'deadline' | 'recurring' | 'custom';

export type TriggerFrequency = 'daily' | 'weekly' | 'escalating';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface ContextualEvent {
  eventId: string;
  userId: string;
  eventType: EventType;
  name: string; // "Christmas", "Tax Season", "Mom's Birthday"
  description?: string;
  dateRange: DateRange;
  reminderWindow: number; // days before event to start reminding
  frequency: TriggerFrequency; // how often to remind
  relatedTaskIds: string[];
  active: boolean;
  color?: string; // for UI categorization
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContextualEventDocument {
  eventId: string;
  userId: string;
  eventType: EventType;
  name: string;
  description?: string;
  dateRange: {
    start: Timestamp;
    end: Timestamp;
  };
  reminderWindow: number;
  frequency: TriggerFrequency;
  relatedTaskIds: string[];
  active: boolean;
  color?: string;
  icon?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateEventInput {
  name: string;
  eventType: EventType;
  description?: string;
  dateRange: DateRange;
  reminderWindow?: number;
  frequency?: TriggerFrequency;
  color?: string;
  icon?: string;
}

export interface TaskAccumulationTrigger {
  category: string;
  threshold: number; // number of tasks
  currentCount: number;
  lastNotified?: Date;
}

export interface TimeBasedTrigger {
  id: string;
  name: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  hour: number; // 0-23
  minute: number; // 0-59
  message: string;
  enabled: boolean;
}

export const DEFAULT_TIME_TRIGGERS: Omit<TimeBasedTrigger, 'id'>[] = [
  {
    name: 'Week Planning',
    dayOfWeek: 0, // Sunday
    hour: 18,
    minute: 0,
    message: 'Plan your week ahead',
    enabled: true,
  },
  {
    name: 'Weekend Prep',
    dayOfWeek: 5, // Friday
    hour: 16,
    minute: 0,
    message: 'Finish up before the weekend',
    enabled: true,
  },
  {
    name: 'Morning Review',
    dayOfWeek: 1, // Monday
    hour: 9,
    minute: 0,
    message: 'Review your tasks for the week',
    enabled: false,
  },
];
