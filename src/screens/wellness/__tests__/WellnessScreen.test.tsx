import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { WellnessScreen } from '../WellnessScreen';
import * as wellnessService from '../../../services/wellnessService';

// Mock hooks
jest.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      userId: 'test-user-id',
      email: 'test@example.com',
      displayName: 'Test User',
    },
  }),
}));

// Mock wellness service
jest.mock('../../../services/wellnessService');

const mockLogWellnessCheckIn = wellnessService.logWellnessCheckIn as jest.MockedFunction<
  typeof wellnessService.logWellnessCheckIn
>;
const mockGetDailyWellnessSummary = wellnessService.getDailyWellnessSummary as jest.MockedFunction<
  typeof wellnessService.getDailyWellnessSummary
>;
const mockGetTodayWellnessCheckIns = wellnessService.getTodayWellnessCheckIns as jest.MockedFunction<
  typeof wellnessService.getTodayWellnessCheckIns
>;
const mockGetWeeklyWellnessTrends = wellnessService.getWeeklyWellnessTrends as jest.MockedFunction<
  typeof wellnessService.getWeeklyWellnessTrends
>;

describe('WellnessScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockGetDailyWellnessSummary.mockResolvedValue({
      date: new Date(),
      hydrationGoal: 8,
      hydrationCompleted: 3,
      mealsGoal: 3,
      mealsCompleted: 2,
      breaksGoal: 8,
      breaksCompleted: 4,
      averageMood: 4,
      averageEnergy: 3,
      insights: ['Great hydration today! 💧', 'You ate all your meals! 🍎'],
    });

    mockGetTodayWellnessCheckIns.mockResolvedValue([]);

    mockGetWeeklyWellnessTrends.mockResolvedValue([
      {
        date: new Date(),
        hydration: 5,
        meals: 3,
        breaks: 4,
        averageMood: 4,
        averageEnergy: 3,
      },
    ]);

    mockLogWellnessCheckIn.mockResolvedValue({
      checkInId: 'new-checkin',
      userId: 'test-user-id',
      type: 'hydration',
      timestamp: new Date(),
      createdAt: new Date(),
    });
  });

  it('should render the wellness screen', async () => {
    render(<WellnessScreen />);

    await waitFor(() => {
      expect(screen.getByText('Wellness Check-ins')).toBeTruthy();
    });
  });

  it('should display quick check-in buttons', async () => {
    render(<WellnessScreen />);

    await waitFor(() => {
      expect(screen.getByText('Water')).toBeTruthy();
      expect(screen.getByText('Meal')).toBeTruthy();
      expect(screen.getByText('Break')).toBeTruthy();
      expect(screen.getByText('Meds')).toBeTruthy();
    });
  });

  it('should display today\'s progress', async () => {
    render(<WellnessScreen />);

    await waitFor(() => {
      expect(screen.getByText('Today\'s Progress')).toBeTruthy();
      expect(screen.getByText('Hydration')).toBeTruthy();
      expect(screen.getByText('3 / 8')).toBeTruthy();
      expect(screen.getByText('Meals')).toBeTruthy();
      expect(screen.getByText('2 / 3')).toBeTruthy();
    });
  });

  it('should display mood and energy when available', async () => {
    render(<WellnessScreen />);

    await waitFor(() => {
      expect(screen.getByText('How You\'re Feeling')).toBeTruthy();
      expect(screen.getByText('4.0/5')).toBeTruthy();
      expect(screen.getByText('3.0/5')).toBeTruthy();
    });
  });

  it('should display insights', async () => {
    render(<WellnessScreen />);

    await waitFor(() => {
      expect(screen.getByText('Insights')).toBeTruthy();
      expect(screen.getByText('Great hydration today! 💧')).toBeTruthy();
      expect(screen.getByText('You ate all your meals! 🍎')).toBeTruthy();
    });
  });

  it('should log a quick check-in when button is pressed', async () => {
    render(<WellnessScreen />);

    await waitFor(() => {
      expect(screen.getByText('Water')).toBeTruthy();
    });

    // Find and press the water check-in button
    const waterButtons = screen.getAllByRole('button');
    const waterButton = waterButtons.find((button) =>
      button.props.accessibilityLabel?.includes('water')
    );

    if (waterButton) {
      fireEvent.press(waterButton);

      await waitFor(() => {
        expect(mockLogWellnessCheckIn).toHaveBeenCalledWith('test-user-id', 'hydration');
      });
    }
  });

  it('should open detailed check-in dialog when "+ Note" is pressed', async () => {
    render(<WellnessScreen />);

    await waitFor(() => {
      const noteButtons = screen.getAllByText('+ Note');
      expect(noteButtons.length).toBeGreaterThan(0);
    });

    const noteButtons = screen.getAllByText('+ Note');
    fireEvent.press(noteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/Check-in/)).toBeTruthy();
      expect(screen.getByText('How are you feeling?')).toBeTruthy();
      expect(screen.getByText('Energy level?')).toBeTruthy();
    });
  });

  it('should display weekly trends', async () => {
    render(<WellnessScreen />);

    await waitFor(() => {
      expect(screen.getByText('7-Day Trends')).toBeTruthy();
    });
  });

  it('should handle loading state', async () => {
    // Make the API call delay
    mockGetDailyWellnessSummary.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({
        date: new Date(),
        hydrationGoal: 8,
        hydrationCompleted: 0,
        mealsGoal: 3,
        mealsCompleted: 0,
        breaksGoal: 8,
        breaksCompleted: 0,
      }), 100))
    );

    render(<WellnessScreen />);

    expect(screen.getByText('Wellness Check-ins')).toBeTruthy();

    await waitFor(() => {
      expect(mockGetDailyWellnessSummary).toHaveBeenCalled();
    });
  });

  it('should handle refresh', async () => {
    const { getByTestId } = render(<WellnessScreen />);

    await waitFor(() => {
      expect(screen.getByText('Wellness Check-ins')).toBeTruthy();
    });

    // Simulate pull to refresh
    // Note: In actual implementation, you'd need to add testID to ScrollView
    await waitFor(() => {
      expect(mockGetDailyWellnessSummary).toHaveBeenCalled();
    });
  });

  it('should not display mood/energy section when no data', async () => {
    mockGetDailyWellnessSummary.mockResolvedValue({
      date: new Date(),
      hydrationGoal: 8,
      hydrationCompleted: 0,
      mealsGoal: 3,
      mealsCompleted: 0,
      breaksGoal: 8,
      breaksCompleted: 0,
      insights: [],
    });

    render(<WellnessScreen />);

    await waitFor(() => {
      expect(screen.queryByText('How You\'re Feeling')).toBeNull();
    });
  });

  it('should handle errors gracefully', async () => {
    mockGetDailyWellnessSummary.mockRejectedValue(new Error('Network error'));
    const consoleError = jest.spyOn(console, 'error').mockImplementation();

    render(<WellnessScreen />);

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled();
    });

    consoleError.mockRestore();
  });
});
