import { Timestamp } from 'firebase/firestore';

export type NotificationType =
  | 'task-reminder'
  | 'task-due-soon'
  | 'task-overdue'
  | 'wellness-hydration'
  | 'wellness-meal'
  | 'wellness-break'
  | 'contextual-date-proximity'
  | 'contextual-task-accumulation'
  | 'contextual-time-based';

export type NotificationStatus = 'scheduled' | 'sent' | 'failed' | 'cancelled';

export type InteractionType = 'opened' | 'dismissed' | 'snoozed' | 'action-taken';

export interface NotificationData {
  type: NotificationType;
  taskId?: string;
  eventId?: string;
  category?: string;
  wellnessType?: string;
  [key: string]: any;
}

export interface Notification {
  notificationId: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: NotificationData;
  scheduledFor: Date;
  sentAt?: Date;
  status: NotificationStatus;
  interactionType?: InteractionType;
  interactedAt?: Date;
  snoozedUntil?: Date;
}

export interface NotificationDocument {
  notificationId: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: NotificationData;
  scheduledFor: Timestamp;
  sentAt?: Timestamp;
  status: NotificationStatus;
  interactionType?: InteractionType;
  interactedAt?: Timestamp;
  snoozedUntil?: Timestamp;
}

export interface ScheduleNotificationInput {
  type: NotificationType;
  title: string;
  body: string;
  scheduledFor: Date;
  data?: NotificationData;
  repeat?: boolean;
  repeatInterval?: number; // in seconds
}

export interface SnoozeDuration {
  label: string;
  minutes: number;
}

export const SNOOZE_DURATIONS: SnoozeDuration[] = [
  { label: '5 minutes', minutes: 5 },
  { label: '15 minutes', minutes: 15 },
  { label: '30 minutes', minutes: 30 },
  { label: '1 hour', minutes: 60 },
  { label: '2 hours', minutes: 120 },
];
