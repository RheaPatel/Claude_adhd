import { useEffect } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { useUserStore } from '../store/userStore';
import { updateUserSettings } from '../services/firebase/auth';
import { UserSettings, WellnessSettings, NotificationPreferences, TaskDefaults } from '../types';

/**
 * Hook to sync settings between Zustand store and Firestore
 */
export const useSettings = () => {
  const user = useUserStore((state) => state.user);
  const {
    settings,
    setSettings,
    updateSettings,
    updateWellnessSettings,
    updateNotificationPreferences,
    updateTaskDefaults,
  } = useSettingsStore();

  // Load settings from user object when user signs in
  useEffect(() => {
    if (user?.settings) {
      setSettings(user.settings);
    }
  }, [user, setSettings]);

  // Sync settings to Firestore when they change
  const syncSettings = async (updatedSettings: Partial<UserSettings>) => {
    if (!user) return;

    try {
      await updateUserSettings(user.userId, updatedSettings);
    } catch (error) {
      console.error('Error syncing settings to Firestore:', error);
    }
  };

  // Enhanced update functions that sync to Firestore
  const updateAndSync = async (updates: Partial<UserSettings>) => {
    updateSettings(updates);
    await syncSettings(updates);
  };

  const updateWellnessAndSync = async (wellness: Partial<WellnessSettings>) => {
    updateWellnessSettings(wellness);
    await syncSettings({ wellnessCheckIns: { ...settings!.wellnessCheckIns, ...wellness } });
  };

  const updateNotificationPreferencesAndSync = async (prefs: Partial<NotificationPreferences>) => {
    updateNotificationPreferences(prefs);
    await syncSettings({
      notificationPreferences: { ...settings!.notificationPreferences, ...prefs },
    });
  };

  const updateTaskDefaultsAndSync = async (defaults: Partial<TaskDefaults>) => {
    updateTaskDefaults(defaults);
    await syncSettings({ taskDefaults: { ...settings!.taskDefaults, ...defaults } });
  };

  return {
    settings,
    updateSettings: updateAndSync,
    updateWellnessSettings: updateWellnessAndSync,
    updateNotificationPreferences: updateNotificationPreferencesAndSync,
    updateTaskDefaults: updateTaskDefaultsAndSync,
  };
};
