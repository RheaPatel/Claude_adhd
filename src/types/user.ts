import { Timestamp } from 'firebase/firestore';

export interface WellnessCheckIn {
  type: 'hydration' | 'meal' | 'break' | 'medication' | 'custom';
  enabled: boolean;
  frequency?: number; // in hours for hydration/breaks
  times?: string[]; // specific times for meals (HH:mm format)
  customTimes?: string[]; // override default schedule
  label?: string; // for custom check-ins
}

export interface WellnessSettings {
  hydration: {
    enabled: boolean;
    frequency: number; // hours between reminders
    startTime: string; // HH:mm format (e.g., "08:00")
    endTime: string; // HH:mm format (e.g., "20:00")
  };
  meals: {
    enabled: boolean;
    times: string[]; // ["08:00", "13:00", "19:00"]
  };
  breaks: {
    enabled: boolean;
    interval: number; // minutes
    workHoursOnly: boolean;
    workStartTime?: string; // HH:mm
    workEndTime?: string; // HH:mm
  };
  customCheckIns?: WellnessCheckIn[];
}

export interface TaskDefaults {
  autoCategorizationEnabled: boolean;
  urgencyLearningEnabled: boolean;
  defaultCategory?: string;
  defaultUrgency?: string;
}

export interface NotificationPreferences {
  enabled: boolean;
  taskReminders: boolean;
  wellnessCheckIns: boolean;
  contextualReminders: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart?: string; // HH:mm
  quietHoursEnd?: string; // HH:mm
  sound: boolean;
  vibration: boolean;
}

export interface UserSettings {
  notificationPreferences: NotificationPreferences;
  wellnessCheckIns: WellnessSettings;
  taskDefaults: TaskDefaults;
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
}

export interface User {
  userId: string;
  email: string;
  displayName: string;
  photoURL?: string;
  settings: UserSettings;
  createdAt: Date;
  lastLoginAt?: Date;
  deviceTokens?: string[]; // FCM tokens for push notifications
}

export interface UserDocument {
  userId: string;
  email: string;
  displayName: string;
  photoURL?: string;
  settings: UserSettings;
  createdAt: Timestamp;
  lastLoginAt?: Timestamp;
  deviceTokens?: string[];
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}
