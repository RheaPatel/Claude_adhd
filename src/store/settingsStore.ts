import { create } from 'zustand';
import { UserSettings, WellnessSettings, NotificationPreferences, TaskDefaults } from '../types';

interface SettingsState {
  settings: UserSettings | null;
  setSettings: (settings: UserSettings) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  updateWellnessSettings: (wellness: Partial<WellnessSettings>) => void;
  updateNotificationPreferences: (prefs: Partial<NotificationPreferences>) => void;
  updateTaskDefaults: (defaults: Partial<TaskDefaults>) => void;
  clearSettings: () => void;
}

// Default settings for new users
export const DEFAULT_SETTINGS: UserSettings = {
  notificationPreferences: {
    enabled: true,
    taskReminders: true,
    wellnessCheckIns: false,
    contextualReminders: true,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    sound: true,
    vibration: true,
  },
  wellnessCheckIns: {
    hydration: {
      enabled: false,
      frequency: 2, // every 2 hours
      startTime: '08:00',
      endTime: '20:00',
    },
    meals: {
      enabled: false,
      times: ['08:00', '13:00', '19:00'], // breakfast, lunch, dinner
    },
    breaks: {
      enabled: false,
      interval: 25, // Pomodoro: 25 minutes
      workHoursOnly: true,
      workStartTime: '09:00',
      workEndTime: '17:00',
    },
  },
  taskDefaults: {
    autoCategorizationEnabled: true,
    urgencyLearningEnabled: true,
  },
  theme: 'auto',
};

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: DEFAULT_SETTINGS,

  setSettings: (settings) => set({ settings }),

  updateSettings: (updates) =>
    set((state) => ({
      settings: state.settings
        ? {
            ...state.settings,
            ...updates,
          }
        : null,
    })),

  updateWellnessSettings: (wellness) =>
    set((state) => ({
      settings: state.settings
        ? {
            ...state.settings,
            wellnessCheckIns: {
              ...state.settings.wellnessCheckIns,
              ...wellness,
            },
          }
        : null,
    })),

  updateNotificationPreferences: (prefs) =>
    set((state) => ({
      settings: state.settings
        ? {
            ...state.settings,
            notificationPreferences: {
              ...state.settings.notificationPreferences,
              ...prefs,
            },
          }
        : null,
    })),

  updateTaskDefaults: (defaults) =>
    set((state) => ({
      settings: state.settings
        ? {
            ...state.settings,
            taskDefaults: {
              ...state.settings.taskDefaults,
              ...defaults,
            },
          }
        : null,
    })),

  clearSettings: () => set({ settings: DEFAULT_SETTINGS }),
}));
