import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Text,
  Button,
  Divider,
  Switch,
  List,
  TextInput,
  Dialog,
  Portal,
  RadioButton,
  Snackbar,
} from 'react-native-paper';
import Constants from 'expo-constants';
import { useAuth } from '../../hooks/useAuth';
import { useSettings } from '../../hooks/useSettings';
import { COLORS, SPACING } from '../../constants/theme';

export const SettingsScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const {
    settings,
    updateSettings,
    updateNotificationPreferences,
    updateWellnessSettings,
    updateTaskDefaults,
  } = useSettings();

  // Dialog states
  const [showHydrationDialog, setShowHydrationDialog] = useState(false);
  const [showMealsDialog, setShowMealsDialog] = useState(false);
  const [showBreaksDialog, setShowBreaksDialog] = useState(false);
  const [showQuietHoursDialog, setShowQuietHoursDialog] = useState(false);
  const [showThemeDialog, setShowThemeDialog] = useState(false);

  // Snackbar state
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Temporary state for dialogs
  const [tempHydrationFreq, setTempHydrationFreq] = useState(
    settings?.wellnessCheckIns.hydration.frequency.toString() || '2'
  );
  const [tempHydrationStart, setTempHydrationStart] = useState(
    settings?.wellnessCheckIns.hydration.startTime || '08:00'
  );
  const [tempHydrationEnd, setTempHydrationEnd] = useState(
    settings?.wellnessCheckIns.hydration.endTime || '20:00'
  );

  const [tempBreakInterval, setTempBreakInterval] = useState(
    settings?.wellnessCheckIns.breaks.interval.toString() || '25'
  );

  const [tempQuietStart, setTempQuietStart] = useState(
    settings?.notificationPreferences.quietHoursStart || '22:00'
  );
  const [tempQuietEnd, setTempQuietEnd] = useState(
    settings?.notificationPreferences.quietHoursEnd || '08:00'
  );

  // Meal times state - use optional chaining for safe array access
  const [tempBreakfastTime, setTempBreakfastTime] = useState(
    settings?.wellnessCheckIns?.meals?.times?.[0] ?? '08:00'
  );
  const [tempLunchTime, setTempLunchTime] = useState(
    settings?.wellnessCheckIns?.meals?.times?.[1] ?? '13:00'
  );
  const [tempDinnerTime, setTempDinnerTime] = useState(
    settings?.wellnessCheckIns?.meals?.times?.[2] ?? '19:00'
  );

  // Theme state for dialog
  const [tempTheme, setTempTheme] = useState<'light' | 'dark' | 'auto'>(
    settings?.theme || 'auto'
  );

  // Time format validation helper
  // Matches HH:MM format where HH is 00-23 and MM is 00-59
  // Requires two-digit format for hours (e.g., 08:00, not 8:00)
  const isValidTimeFormat = (time: string): boolean => {
    const TIME_REGEX = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
    return TIME_REGEX.test(time);
  };

  const showSaveConfirmation = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (error) {
            console.error('Sign out error:', error);
          }
        },
      },
    ]);
  };

  const handleClearCompletedTasks = () => {
    Alert.alert(
      'Clear Completed Tasks',
      'This will permanently delete all completed tasks. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              const { clearCompletedTasks } = await import('../../services/dataManagementService');
              const count = await clearCompletedTasks(user!.userId);
              Alert.alert('Success', `Deleted ${count} completed tasks.`);
            } catch (error) {
              console.error('Error clearing completed tasks:', error);
              Alert.alert('Error', 'Failed to clear completed tasks. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleResetLearning = () => {
    Alert.alert(
      'Reset Learning Patterns',
      'This will clear all urgency learning patterns. The system will start learning from scratch.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              const { resetUrgencyLearning } = await import('../../services/dataManagementService');
              const count = await resetUrgencyLearning(user!.userId);
              Alert.alert('Success', `Reset ${count} urgency patterns.`);
            } catch (error) {
              console.error('Error resetting learning:', error);
              Alert.alert('Error', 'Failed to reset learning patterns. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleClearWellnessHistory = () => {
    Alert.alert(
      'Clear Wellness History',
      'This will permanently delete all wellness check-in history. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              const { clearWellnessHistory } = await import('../../services/dataManagementService');
              const count = await clearWellnessHistory(user!.userId);
              Alert.alert('Success', `Deleted ${count} wellness check-ins.`);
            } catch (error) {
              console.error('Error clearing wellness history:', error);
              Alert.alert('Error', 'Failed to clear wellness history. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleExportData = async () => {
    try {
      const { exportTasksAsJSON, exportWellnessAsJSON } = await import('../../services/dataManagementService');
      const [tasksData, wellnessData] = await Promise.all([
        exportTasksAsJSON(user!.userId),
        exportWellnessAsJSON(user!.userId),
      ]);

      const exportData = {
        exportDate: new Date().toISOString(),
        tasks: JSON.parse(tasksData),
        wellness: JSON.parse(wellnessData),
      };

      // In a real app, you would save this to a file or share it
      console.log('Export data:', JSON.stringify(exportData, null, 2));
      Alert.alert('Export Ready', 'Your data has been exported. Check the console for now.');
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', 'Failed to export data. Please try again.');
    }
  };

  const saveHydrationSettings = () => {
    updateWellnessSettings({
      hydration: {
        ...settings!.wellnessCheckIns.hydration,
        frequency: parseInt(tempHydrationFreq) || 2,
        startTime: tempHydrationStart,
        endTime: tempHydrationEnd,
      },
    });
    setShowHydrationDialog(false);
    showSaveConfirmation('Hydration settings saved');
  };

  const saveBreakSettings = () => {
    updateWellnessSettings({
      breaks: {
        ...settings!.wellnessCheckIns.breaks,
        interval: parseInt(tempBreakInterval) || 25,
      },
    });
    setShowBreaksDialog(false);
    showSaveConfirmation('Break settings saved');
  };

  const saveQuietHours = () => {
    updateNotificationPreferences({
      quietHoursStart: tempQuietStart,
      quietHoursEnd: tempQuietEnd,
    });
    setShowQuietHoursDialog(false);
    showSaveConfirmation('Quiet hours saved');
  };

  const saveMealTimes = () => {
    // Validate time formats with specific error messages
    const invalidFields: string[] = [];
    if (!isValidTimeFormat(tempBreakfastTime)) {
      invalidFields.push('Breakfast');
    }
    if (!isValidTimeFormat(tempLunchTime)) {
      invalidFields.push('Lunch');
    }
    if (!isValidTimeFormat(tempDinnerTime)) {
      invalidFields.push('Dinner');
    }

    if (invalidFields.length > 0) {
      Alert.alert(
        'Invalid Time Format',
        `Please enter valid times in HH:MM format for: ${invalidFields.join(', ')}\n\nExamples: 08:00, 13:30, 19:00`
      );
      return;
    }

    updateWellnessSettings({
      meals: {
        ...settings!.wellnessCheckIns.meals,
        times: [tempBreakfastTime, tempLunchTime, tempDinnerTime],
      },
    });
    setShowMealsDialog(false);
    showSaveConfirmation('Meal times saved');
  };

  const saveTheme = () => {
    updateSettings({ theme: tempTheme });
    setShowThemeDialog(false);
    showSaveConfirmation('Theme preference saved');
  };

  const openThemeDialog = () => {
    setTempTheme(settings?.theme || 'auto');
    setShowThemeDialog(true);
  };

  const getThemeLabel = (theme?: 'light' | 'dark' | 'auto') => {
    switch (theme) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'auto':
      default:
        return 'System Default';
    }
  };

  if (!settings) return null;

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Settings
      </Text>

      {/* Account Section */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Account
        </Text>
        <Text variant="bodyMedium" style={styles.userInfo}>
          {user?.displayName}
        </Text>
        <Text variant="bodySmall" style={styles.userEmail}>
          {user?.email}
        </Text>
      </View>

      <Divider style={styles.divider} />

      {/* Notification Preferences */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Notifications
        </Text>

        <List.Item
          title="Enable Notifications"
          description="Master switch for all notifications"
          left={(props) => <List.Icon {...props} icon="bell" />}
          right={() => (
            <Switch
              value={settings.notificationPreferences.enabled}
              onValueChange={(value) =>
                updateNotificationPreferences({ enabled: value })
              }
            />
          )}
        />

        <List.Item
          title="Task Reminders"
          description="Get reminded about due dates"
          left={(props) => <List.Icon {...props} icon="calendar-alert" />}
          right={() => (
            <Switch
              value={settings.notificationPreferences.taskReminders}
              onValueChange={(value) =>
                updateNotificationPreferences({ taskReminders: value })
              }
              disabled={!settings.notificationPreferences.enabled}
            />
          )}
        />

        <List.Item
          title="Wellness Check-ins"
          description="Hydration, meals, and breaks"
          left={(props) => <List.Icon {...props} icon="heart-pulse" />}
          right={() => (
            <Switch
              value={settings.notificationPreferences.wellnessCheckIns}
              onValueChange={(value) =>
                updateNotificationPreferences({ wellnessCheckIns: value })
              }
              disabled={!settings.notificationPreferences.enabled}
            />
          )}
        />

        <List.Item
          title="Contextual Reminders"
          description="Smart suggestions based on your tasks"
          left={(props) => <List.Icon {...props} icon="lightbulb-on" />}
          right={() => (
            <Switch
              value={settings.notificationPreferences.contextualReminders}
              onValueChange={(value) =>
                updateNotificationPreferences({ contextualReminders: value })
              }
              disabled={!settings.notificationPreferences.enabled}
            />
          )}
        />

        <List.Item
          title="Sound"
          left={(props) => <List.Icon {...props} icon="volume-high" />}
          right={() => (
            <Switch
              value={settings.notificationPreferences.sound}
              onValueChange={(value) =>
                updateNotificationPreferences({ sound: value })
              }
              disabled={!settings.notificationPreferences.enabled}
            />
          )}
        />

        <List.Item
          title="Vibration"
          left={(props) => <List.Icon {...props} icon="vibrate" />}
          right={() => (
            <Switch
              value={settings.notificationPreferences.vibration}
              onValueChange={(value) =>
                updateNotificationPreferences({ vibration: value })
              }
              disabled={!settings.notificationPreferences.enabled}
            />
          )}
        />

        <List.Item
          title="Quiet Hours"
          description={
            settings.notificationPreferences.quietHoursEnabled
              ? `${settings.notificationPreferences.quietHoursStart} - ${settings.notificationPreferences.quietHoursEnd}`
              : 'No notifications during specific hours'
          }
          left={(props) => <List.Icon {...props} icon="moon-waning-crescent" />}
          right={() => (
            <Switch
              value={settings.notificationPreferences.quietHoursEnabled}
              onValueChange={(value) =>
                updateNotificationPreferences({ quietHoursEnabled: value })
              }
              disabled={!settings.notificationPreferences.enabled}
            />
          )}
          onPress={() => setShowQuietHoursDialog(true)}
        />
      </View>

      <Divider style={styles.divider} />

      {/* Wellness Check-ins */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Wellness Check-ins
        </Text>

        <List.Item
          title="Hydration Reminders"
          description={
            settings.wellnessCheckIns.hydration.enabled
              ? `Every ${settings.wellnessCheckIns.hydration.frequency}h (${settings.wellnessCheckIns.hydration.startTime} - ${settings.wellnessCheckIns.hydration.endTime})`
              : 'Stay hydrated throughout the day'
          }
          left={(props) => <List.Icon {...props} icon="water" color="#3B82F6" />}
          right={() => (
            <Switch
              value={settings.wellnessCheckIns.hydration.enabled}
              onValueChange={(value) =>
                updateWellnessSettings({
                  hydration: { ...settings.wellnessCheckIns.hydration, enabled: value },
                })
              }
            />
          )}
          onPress={() => setShowHydrationDialog(true)}
        />

        <List.Item
          title="Meal Reminders"
          description={
            settings.wellnessCheckIns.meals.enabled
              ? `${settings.wellnessCheckIns.meals.times.join(', ')}`
              : 'Remember to eat regularly'
          }
          left={(props) => <List.Icon {...props} icon="food-apple" color="#10B981" />}
          right={() => (
            <Switch
              value={settings.wellnessCheckIns.meals.enabled}
              onValueChange={(value) =>
                updateWellnessSettings({
                  meals: { ...settings.wellnessCheckIns.meals, enabled: value },
                })
              }
            />
          )}
          onPress={() => setShowMealsDialog(true)}
        />

        <List.Item
          title="Break Reminders"
          description={
            settings.wellnessCheckIns.breaks.enabled
              ? `Every ${settings.wellnessCheckIns.breaks.interval} min`
              : 'Take regular breaks to stay focused'
          }
          left={(props) => <List.Icon {...props} icon="coffee" color="#F59E0B" />}
          right={() => (
            <Switch
              value={settings.wellnessCheckIns.breaks.enabled}
              onValueChange={(value) =>
                updateWellnessSettings({
                  breaks: { ...settings.wellnessCheckIns.breaks, enabled: value },
                })
              }
            />
          )}
          onPress={() => setShowBreaksDialog(true)}
        />
      </View>

      <Divider style={styles.divider} />

      {/* Task Defaults */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Task Defaults
        </Text>

        <List.Item
          title="Auto-Categorization"
          description="Automatically suggest task categories"
          left={(props) => <List.Icon {...props} icon="auto-fix" />}
          right={() => (
            <Switch
              value={settings.taskDefaults.autoCategorizationEnabled}
              onValueChange={(value) =>
                updateTaskDefaults({ autoCategorizationEnabled: value })
              }
            />
          )}
        />

        <List.Item
          title="Urgency Learning"
          description="Learn from your behavior to suggest urgency"
          left={(props) => <List.Icon {...props} icon="brain" />}
          right={() => (
            <Switch
              value={settings.taskDefaults.urgencyLearningEnabled}
              onValueChange={(value) =>
                updateTaskDefaults({ urgencyLearningEnabled: value })
              }
            />
          )}
        />
      </View>

      <Divider style={styles.divider} />

      {/* Appearance */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Appearance
        </Text>

        <List.Item
          title="Theme"
          description={getThemeLabel(settings.theme)}
          left={(props) => <List.Icon {...props} icon="palette" />}
          onPress={openThemeDialog}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
        />
      </View>

      <Divider style={styles.divider} />

      {/* Data Management */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Data Management
        </Text>

        <Button
          mode="outlined"
          onPress={handleClearCompletedTasks}
          style={styles.button}
          icon="delete-sweep"
        >
          Clear Completed Tasks
        </Button>

        <Button
          mode="outlined"
          onPress={handleClearWellnessHistory}
          style={styles.button}
          icon="heart-remove"
        >
          Clear Wellness History
        </Button>

        <Button
          mode="outlined"
          onPress={handleResetLearning}
          style={styles.button}
          icon="refresh"
        >
          Reset Learning Patterns
        </Button>

        <Button
          mode="outlined"
          onPress={handleExportData}
          style={styles.button}
          icon="download"
        >
          Export My Data
        </Button>
      </View>

      <Divider style={styles.divider} />

      {/* Sign Out */}
      <View style={styles.section}>
        <Button
          mode="outlined"
          onPress={handleSignOut}
          style={styles.button}
          textColor={COLORS.error}
          icon="logout"
        >
          Sign Out
        </Button>
      </View>

      <Divider style={styles.divider} />

      {/* About */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          About
        </Text>
        <List.Item
          title="App Version"
          description={Constants.expoConfig?.version || '1.0.0'}
          left={(props) => <List.Icon {...props} icon="information" />}
        />
        <List.Item
          title="ADHD Focus App"
          description="Helping you stay focused and organized"
          left={(props) => <List.Icon {...props} icon="heart" />}
        />
      </View>

      {/* Hydration Dialog */}
      <Portal>
        <Dialog visible={showHydrationDialog} onDismiss={() => setShowHydrationDialog(false)}>
          <Dialog.Title>Hydration Settings</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Frequency (hours)"
              value={tempHydrationFreq}
              onChangeText={setTempHydrationFreq}
              keyboardType="numeric"
              mode="outlined"
              style={styles.dialogInput}
            />
            <TextInput
              label="Start Time (HH:MM)"
              value={tempHydrationStart}
              onChangeText={setTempHydrationStart}
              placeholder="08:00"
              mode="outlined"
              style={styles.dialogInput}
            />
            <TextInput
              label="End Time (HH:MM)"
              value={tempHydrationEnd}
              onChangeText={setTempHydrationEnd}
              placeholder="20:00"
              mode="outlined"
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowHydrationDialog(false)}>Cancel</Button>
            <Button onPress={saveHydrationSettings}>Save</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Meals Dialog */}
        <Dialog visible={showMealsDialog} onDismiss={() => setShowMealsDialog(false)}>
          <Dialog.Title>Meal Reminders</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={styles.dialogText}>
              Customize your meal reminder times:
            </Text>
            <TextInput
              label="🌅 Breakfast Time (HH:MM)"
              value={tempBreakfastTime}
              onChangeText={setTempBreakfastTime}
              placeholder="08:00"
              mode="outlined"
              style={styles.dialogInput}
            />
            <TextInput
              label="☀️ Lunch Time (HH:MM)"
              value={tempLunchTime}
              onChangeText={setTempLunchTime}
              placeholder="13:00"
              mode="outlined"
              style={styles.dialogInput}
            />
            <TextInput
              label="🌙 Dinner Time (HH:MM)"
              value={tempDinnerTime}
              onChangeText={setTempDinnerTime}
              placeholder="19:00"
              mode="outlined"
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowMealsDialog(false)}>Cancel</Button>
            <Button onPress={saveMealTimes}>Save</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Breaks Dialog */}
        <Dialog visible={showBreaksDialog} onDismiss={() => setShowBreaksDialog(false)}>
          <Dialog.Title>Break Reminders</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Interval (minutes)"
              value={tempBreakInterval}
              onChangeText={setTempBreakInterval}
              keyboardType="numeric"
              mode="outlined"
              style={styles.dialogInput}
            />
            <Text variant="bodySmall" style={styles.dialogHint}>
              Recommended: 25 minutes (Pomodoro technique)
            </Text>
            <List.Item
              title="Work Hours Only"
              description={
                settings.wellnessCheckIns.breaks.workHoursOnly
                  ? `${settings.wellnessCheckIns.breaks.workStartTime} - ${settings.wellnessCheckIns.breaks.workEndTime}`
                  : 'Remind me all day'
              }
              right={() => (
                <Switch
                  value={settings.wellnessCheckIns.breaks.workHoursOnly}
                  onValueChange={(value) =>
                    updateWellnessSettings({
                      breaks: { ...settings.wellnessCheckIns.breaks, workHoursOnly: value },
                    })
                  }
                />
              )}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowBreaksDialog(false)}>Cancel</Button>
            <Button onPress={saveBreakSettings}>Save</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Quiet Hours Dialog */}
        <Dialog visible={showQuietHoursDialog} onDismiss={() => setShowQuietHoursDialog(false)}>
          <Dialog.Title>Quiet Hours</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Start Time (HH:MM)"
              value={tempQuietStart}
              onChangeText={setTempQuietStart}
              placeholder="22:00"
              mode="outlined"
              style={styles.dialogInput}
            />
            <TextInput
              label="End Time (HH:MM)"
              value={tempQuietEnd}
              onChangeText={setTempQuietEnd}
              placeholder="08:00"
              mode="outlined"
              style={styles.dialogInput}
            />
            <Text variant="bodySmall" style={styles.dialogHint}>
              No notifications will be sent during these hours
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowQuietHoursDialog(false)}>Cancel</Button>
            <Button onPress={saveQuietHours}>Save</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Theme Dialog */}
        <Dialog visible={showThemeDialog} onDismiss={() => setShowThemeDialog(false)}>
          <Dialog.Title>Choose Theme</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              onValueChange={(value) => setTempTheme(value as 'light' | 'dark' | 'auto')}
              value={tempTheme}
            >
              <RadioButton.Item label="Light" value="light" />
              <RadioButton.Item label="Dark" value="dark" />
              <RadioButton.Item label="System Default" value="auto" />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowThemeDialog(false)}>Cancel</Button>
            <Button onPress={saveTheme}>Save</Button>
          </Dialog.Actions>
        </Dialog>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={2000}
          action={{
            label: 'OK',
            onPress: () => setSnackbarVisible(false),
          }}
        >
          {snackbarMessage}
        </Snackbar>
      </Portal>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  title: {
    padding: SPACING.lg,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  sectionTitle: {
    marginBottom: SPACING.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  userInfo: {
    marginBottom: SPACING.xs,
  },
  userEmail: {
    color: COLORS.textSecondary,
  },
  divider: {
    marginVertical: SPACING.md,
  },
  button: {
    marginTop: SPACING.sm,
  },
  dialogInput: {
    marginBottom: SPACING.md,
  },
  dialogText: {
    marginBottom: SPACING.sm,
  },
  dialogHint: {
    marginTop: SPACING.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  mealTime: {
    marginVertical: SPACING.xs,
    paddingLeft: SPACING.sm,
  },
  bottomPadding: {
    height: SPACING.xl,
  },
});
