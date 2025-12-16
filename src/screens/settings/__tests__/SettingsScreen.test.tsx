import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { SettingsScreen } from '../SettingsScreen';
import * as dataManagementService from '../../../services/dataManagementService';

// Mock hooks
jest.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      userId: 'test-user-id',
      email: 'test@example.com',
      displayName: 'Test User',
    },
    signOut: jest.fn(),
  }),
}));

jest.mock('../../../hooks/useSettings', () => ({
  useSettings: () => ({
    settings: {
      notificationPreferences: {
        enabled: true,
        taskReminders: true,
        wellnessCheckIns: true,
        contextualReminders: false,
        quietHoursEnabled: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
        sound: true,
        vibration: true,
      },
      wellnessCheckIns: {
        hydration: {
          enabled: true,
          frequency: 2,
          startTime: '08:00',
          endTime: '20:00',
        },
        meals: {
          enabled: true,
          times: ['08:00', '13:00', '19:00'],
        },
        breaks: {
          enabled: true,
          interval: 25,
          workHoursOnly: false,
          workStartTime: '09:00',
          workEndTime: '17:00',
        },
      },
      taskDefaults: {
        autoCategorizationEnabled: true,
        urgencyLearningEnabled: true,
      },
    },
    updateNotificationPreferences: jest.fn(),
    updateWellnessSettings: jest.fn(),
    updateTaskDefaults: jest.fn(),
  }),
}));

// Mock data management service
jest.mock('../../../services/dataManagementService');

const mockClearCompletedTasks = dataManagementService.clearCompletedTasks as jest.MockedFunction<
  typeof dataManagementService.clearCompletedTasks
>;
const mockResetUrgencyLearning = dataManagementService.resetUrgencyLearning as jest.MockedFunction<
  typeof dataManagementService.resetUrgencyLearning
>;
const mockClearWellnessHistory = dataManagementService.clearWellnessHistory as jest.MockedFunction<
  typeof dataManagementService.clearWellnessHistory
>;
const mockExportTasksAsJSON = dataManagementService.exportTasksAsJSON as jest.MockedFunction<
  typeof dataManagementService.exportTasksAsJSON
>;
const mockExportWellnessAsJSON = dataManagementService.exportWellnessAsJSON as jest.MockedFunction<
  typeof dataManagementService.exportWellnessAsJSON
>;

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    mockClearCompletedTasks.mockResolvedValue(5);
    mockResetUrgencyLearning.mockResolvedValue(10);
    mockClearWellnessHistory.mockResolvedValue(20);
    mockExportTasksAsJSON.mockResolvedValue('[]');
    mockExportWellnessAsJSON.mockResolvedValue('[]');
  });

  afterEach(() => {
    (Alert.alert as jest.Mock).mockRestore();
  });

  it('should render the settings screen', () => {
    render(<SettingsScreen />);

    expect(screen.getByText('Settings')).toBeTruthy();
    expect(screen.getByText('Test User')).toBeTruthy();
    expect(screen.getByText('test@example.com')).toBeTruthy();
  });

  it('should display notification preferences section', () => {
    render(<SettingsScreen />);

    expect(screen.getByText('Notifications')).toBeTruthy();
    expect(screen.getByText('Enable Notifications')).toBeTruthy();
    expect(screen.getByText('Task Reminders')).toBeTruthy();
    expect(screen.getByText('Wellness Check-ins')).toBeTruthy();
    expect(screen.getByText('Contextual Reminders')).toBeTruthy();
  });

  it('should display wellness check-ins section', () => {
    render(<SettingsScreen />);

    expect(screen.getByText('Wellness Check-ins')).toBeTruthy();
    expect(screen.getByText('Hydration Reminders')).toBeTruthy();
    expect(screen.getByText('Meal Reminders')).toBeTruthy();
    expect(screen.getByText('Break Reminders')).toBeTruthy();
  });

  it('should display task defaults section', () => {
    render(<SettingsScreen />);

    expect(screen.getByText('Task Defaults')).toBeTruthy();
    expect(screen.getByText('Auto-Categorization')).toBeTruthy();
    expect(screen.getByText('Urgency Learning')).toBeTruthy();
  });

  it('should display data management section', () => {
    render(<SettingsScreen />);

    expect(screen.getByText('Data Management')).toBeTruthy();
    expect(screen.getByText('Clear Completed Tasks')).toBeTruthy();
    expect(screen.getByText('Clear Wellness History')).toBeTruthy();
    expect(screen.getByText('Reset Learning Patterns')).toBeTruthy();
    expect(screen.getByText('Export My Data')).toBeTruthy();
  });

  it('should show confirmation dialog when clearing completed tasks', () => {
    render(<SettingsScreen />);

    const clearButton = screen.getByText('Clear Completed Tasks');
    fireEvent.press(clearButton);

    expect(Alert.alert).toHaveBeenCalledWith(
      'Clear Completed Tasks',
      'This will permanently delete all completed tasks. This action cannot be undone.',
      expect.any(Array)
    );
  });

  it('should clear completed tasks when confirmed', async () => {
    (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
      // Simulate pressing the destructive button
      const destructiveButton = buttons?.find((b: any) => b.style === 'destructive');
      if (destructiveButton && destructiveButton.onPress) {
        destructiveButton.onPress();
      }
    });

    render(<SettingsScreen />);

    const clearButton = screen.getByText('Clear Completed Tasks');
    fireEvent.press(clearButton);

    await waitFor(() => {
      expect(mockClearCompletedTasks).toHaveBeenCalledWith('test-user-id');
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Success', 'Deleted 5 completed tasks.');
    });
  });

  it('should reset learning patterns when confirmed', async () => {
    (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
      const destructiveButton = buttons?.find((b: any) => b.style === 'destructive');
      if (destructiveButton && destructiveButton.onPress) {
        destructiveButton.onPress();
      }
    });

    render(<SettingsScreen />);

    const resetButton = screen.getByText('Reset Learning Patterns');
    fireEvent.press(resetButton);

    await waitFor(() => {
      expect(mockResetUrgencyLearning).toHaveBeenCalledWith('test-user-id');
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Success', 'Reset 10 urgency patterns.');
    });
  });

  it('should clear wellness history when confirmed', async () => {
    (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
      const destructiveButton = buttons?.find((b: any) => b.style === 'destructive');
      if (destructiveButton && destructiveButton.onPress) {
        destructiveButton.onPress();
      }
    });

    render(<SettingsScreen />);

    const clearButton = screen.getByText('Clear Wellness History');
    fireEvent.press(clearButton);

    await waitFor(() => {
      expect(mockClearWellnessHistory).toHaveBeenCalledWith('test-user-id');
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Success', 'Deleted 20 wellness check-ins.');
    });
  });

  it('should export data when export button is pressed', async () => {
    render(<SettingsScreen />);

    const exportButton = screen.getByText('Export My Data');
    fireEvent.press(exportButton);

    await waitFor(() => {
      expect(mockExportTasksAsJSON).toHaveBeenCalledWith('test-user-id');
      expect(mockExportWellnessAsJSON).toHaveBeenCalledWith('test-user-id');
    });
  });

  it('should handle errors when clearing tasks', async () => {
    mockClearCompletedTasks.mockRejectedValue(new Error('Network error'));

    (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
      const destructiveButton = buttons?.find((b: any) => b.style === 'destructive');
      if (destructiveButton && destructiveButton.onPress) {
        destructiveButton.onPress();
      }
    });

    render(<SettingsScreen />);

    const clearButton = screen.getByText('Clear Completed Tasks');
    fireEvent.press(clearButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to clear completed tasks. Please try again.'
      );
    });
  });

  it('should open hydration settings dialog', () => {
    render(<SettingsScreen />);

    const hydrationItem = screen.getByText('Hydration Reminders');
    fireEvent.press(hydrationItem);

    expect(screen.getByText('Hydration Settings')).toBeTruthy();
    expect(screen.getByText('Frequency (hours)')).toBeTruthy();
  });

  it('should open break settings dialog', () => {
    render(<SettingsScreen />);

    const breakItem = screen.getByText('Break Reminders');
    fireEvent.press(breakItem);

    expect(screen.getByText('Break Reminders')).toBeTruthy();
    expect(screen.getByText('Interval (minutes)')).toBeTruthy();
  });

  it('should display sign out button', () => {
    render(<SettingsScreen />);

    expect(screen.getByText('Sign Out')).toBeTruthy();
  });

  it('should show confirmation when signing out', () => {
    render(<SettingsScreen />);

    const signOutButton = screen.getByText('Sign Out');
    fireEvent.press(signOutButton);

    expect(Alert.alert).toHaveBeenCalledWith(
      'Sign Out',
      'Are you sure you want to sign out?',
      expect.any(Array)
    );
  });
});
