import {
  logWellnessCheckIn,
  getDailyWellnessSummary,
  getWeeklyWellnessTrends,
} from '../../services/wellnessService';
import { addDoc, getDocs } from 'firebase/firestore';
import { subDays } from 'date-fns';

jest.mock('../../services/firebase/config', () => ({
  db: {},
}));

jest.mock('firebase/firestore');

const mockAddDoc = addDoc as jest.MockedFunction<typeof addDoc>;
const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;

describe('Wellness Flow Integration Tests', () => {
  const mockUserId = 'wellness-test-user';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should track a full day of wellness check-ins', async () => {
    const today = new Date();

    // Log morning hydration
    mockAddDoc.mockResolvedValue({ id: 'checkin-1' } as any);
    await logWellnessCheckIn(mockUserId, 'hydration', {
      mood: 3,
      energy: 3,
    });

    // Log breakfast
    mockAddDoc.mockResolvedValue({ id: 'checkin-2' } as any);
    await logWellnessCheckIn(mockUserId, 'meal', {
      mood: 4,
      energy: 4,
      notes: 'Had a healthy breakfast',
    });

    // Log multiple hydration check-ins throughout the day
    for (let i = 0; i < 6; i++) {
      mockAddDoc.mockResolvedValue({ id: `checkin-h-${i}` } as any);
      await logWellnessCheckIn(mockUserId, 'hydration');
    }

    // Log lunch
    mockAddDoc.mockResolvedValue({ id: 'checkin-lunch' } as any);
    await logWellnessCheckIn(mockUserId, 'meal', {
      mood: 4,
      energy: 3,
    });

    // Log breaks
    for (let i = 0; i < 3; i++) {
      mockAddDoc.mockResolvedValue({ id: `checkin-break-${i}` } as any);
      await logWellnessCheckIn(mockUserId, 'break', {
        mood: 4,
        energy: 3,
      });
    }

    // Log dinner
    mockAddDoc.mockResolvedValue({ id: 'checkin-dinner' } as any);
    await logWellnessCheckIn(mockUserId, 'meal', {
      mood: 5,
      energy: 3,
    });

    // Verify all check-ins were logged
    expect(mockAddDoc).toHaveBeenCalledTimes(12);

    // Get daily summary
    const mockCheckIns = [
      ...Array.from({ length: 7 }, (_, i) => ({
        id: `h-${i}`,
        data: () => ({
          checkInId: `h-${i}`,
          userId: mockUserId,
          type: 'hydration',
          timestamp: { toDate: () => today },
          createdAt: { toDate: () => today },
        }),
      })),
      ...Array.from({ length: 3 }, (_, i) => ({
        id: `m-${i}`,
        data: () => ({
          checkInId: `m-${i}`,
          userId: mockUserId,
          type: 'meal',
          mood: 4 + i,
          energy: 3 + i,
          timestamp: { toDate: () => today },
          createdAt: { toDate: () => today },
        }),
      })),
      ...Array.from({ length: 3 }, (_, i) => ({
        id: `b-${i}`,
        data: () => ({
          checkInId: `b-${i}`,
          userId: mockUserId,
          type: 'break',
          mood: 4,
          energy: 3,
          timestamp: { toDate: () => today },
          createdAt: { toDate: () => today },
        }),
      })),
    ];

    mockGetDocs.mockResolvedValue({
      forEach: (callback: any) => mockCheckIns.forEach(callback),
    } as any);

    const summary = await getDailyWellnessSummary(mockUserId, today);

    expect(summary.hydrationCompleted).toBe(7);
    expect(summary.mealsCompleted).toBe(3);
    expect(summary.breaksCompleted).toBe(3);
    expect(summary.averageMood).toBeGreaterThan(0);
    expect(summary.insights).toBeDefined();
  });

  it('should track wellness trends over a week', async () => {
    const today = new Date();

    // Create mock check-ins for 7 days
    const weekCheckIns = [];

    for (let day = 0; day < 7; day++) {
      const date = subDays(today, day);

      // Hydration: varies by day
      for (let h = 0; h < 4 + day; h++) {
        weekCheckIns.push({
          id: `d${day}-h${h}`,
          data: () => ({
            checkInId: `d${day}-h${h}`,
            userId: mockUserId,
            type: 'hydration',
            mood: 3 + (day % 3),
            energy: 2 + (day % 4),
            timestamp: { toDate: () => date },
            createdAt: { toDate: () => date },
          }),
        });
      }

      // Meals: consistent 3 per day
      for (let m = 0; m < 3; m++) {
        weekCheckIns.push({
          id: `d${day}-m${m}`,
          data: () => ({
            checkInId: `d${day}-m${m}`,
            userId: mockUserId,
            type: 'meal',
            mood: 4,
            energy: 3,
            timestamp: { toDate: () => date },
            createdAt: { toDate: () => date },
          }),
        });
      }

      // Breaks: varies by day (simulating workdays vs weekends)
      const breakCount = day < 5 ? 4 : 1; // More breaks on weekdays
      for (let b = 0; b < breakCount; b++) {
        weekCheckIns.push({
          id: `d${day}-b${b}`,
          data: () => ({
            checkInId: `d${day}-b${b}`,
            userId: mockUserId,
            type: 'break',
            timestamp: { toDate: () => date },
            createdAt: { toDate: () => date },
          }),
        });
      }
    }

    mockGetDocs.mockResolvedValue({
      forEach: (callback: any) => weekCheckIns.forEach(callback),
    } as any);

    const trends = await getWeeklyWellnessTrends(mockUserId);

    expect(trends.length).toBeGreaterThan(0);
    expect(trends[0]).toHaveProperty('date');
    expect(trends[0]).toHaveProperty('hydration');
    expect(trends[0]).toHaveProperty('meals');
    expect(trends[0]).toHaveProperty('breaks');
    expect(trends[0]).toHaveProperty('averageMood');
    expect(trends[0]).toHaveProperty('averageEnergy');

    // Verify trends are sorted by date
    for (let i = 1; i < trends.length; i++) {
      expect(trends[i].date.getTime()).toBeGreaterThanOrEqual(
        trends[i - 1].date.getTime()
      );
    }
  });

  it('should generate appropriate insights based on check-in patterns', async () => {
    const today = new Date();

    // Scenario 1: Excellent hydration
    const excellentHydration = Array.from({ length: 10 }, (_, i) => ({
      id: `h-${i}`,
      data: () => ({
        checkInId: `h-${i}`,
        userId: mockUserId,
        type: 'hydration',
        timestamp: { toDate: () => today },
        createdAt: { toDate: () => today },
      }),
    }));

    mockGetDocs.mockResolvedValue({
      forEach: (callback: any) => excellentHydration.forEach(callback),
    } as any);

    let summary = await getDailyWellnessSummary(mockUserId, today);
    expect(summary.insights).toContain('Great hydration today! 💧');

    // Scenario 2: Poor hydration
    const poorHydration = [
      {
        id: 'h-1',
        data: () => ({
          checkInId: 'h-1',
          userId: mockUserId,
          type: 'hydration',
          timestamp: { toDate: () => today },
          createdAt: { toDate: () => today },
        }),
      },
    ];

    mockGetDocs.mockResolvedValue({
      forEach: (callback: any) => poorHydration.forEach(callback),
    } as any);

    summary = await getDailyWellnessSummary(mockUserId, today);
    expect(summary.insights).toContain('Remember to drink more water 💧');

    // Scenario 3: All meals logged
    const allMeals = [
      {
        id: 'm-1',
        data: () => ({
          checkInId: 'm-1',
          userId: mockUserId,
          type: 'meal',
          timestamp: { toDate: () => today },
          createdAt: { toDate: () => today },
        }),
      },
      {
        id: 'm-2',
        data: () => ({
          checkInId: 'm-2',
          userId: mockUserId,
          type: 'meal',
          timestamp: { toDate: () => today },
          createdAt: { toDate: () => today },
        }),
      },
      {
        id: 'm-3',
        data: () => ({
          checkInId: 'm-3',
          userId: mockUserId,
          type: 'meal',
          timestamp: { toDate: () => today },
          createdAt: { toDate: () => today },
        }),
      },
    ];

    mockGetDocs.mockResolvedValue({
      forEach: (callback: any) => allMeals.forEach(callback),
    } as any);

    summary = await getDailyWellnessSummary(mockUserId, today);
    expect(summary.insights).toContain('You ate all your meals! 🍎');
  });

  it('should handle mood and energy tracking throughout the day', async () => {
    const today = new Date();

    // Simulate mood declining throughout the day, then improving after break
    const checkInsWithMoodEnergy = [
      {
        id: 'morning',
        data: () => ({
          checkInId: 'morning',
          userId: mockUserId,
          type: 'hydration',
          mood: 4,
          energy: 4,
          timestamp: { toDate: () => today },
          createdAt: { toDate: () => today },
        }),
      },
      {
        id: 'midday',
        data: () => ({
          checkInId: 'midday',
          userId: mockUserId,
          type: 'meal',
          mood: 3,
          energy: 3,
          timestamp: { toDate: () => today },
          createdAt: { toDate: () => today },
        }),
      },
      {
        id: 'afternoon',
        data: () => ({
          checkInId: 'afternoon',
          userId: mockUserId,
          type: 'break',
          mood: 2,
          energy: 2,
          timestamp: { toDate: () => today },
          createdAt: { toDate: () => today },
        }),
      },
      {
        id: 'evening',
        data: () => ({
          checkInId: 'evening',
          userId: mockUserId,
          type: 'meal',
          mood: 4,
          energy: 3,
          timestamp: { toDate: () => today },
          createdAt: { toDate: () => today },
        }),
      },
    ];

    mockGetDocs.mockResolvedValue({
      forEach: (callback: any) => checkInsWithMoodEnergy.forEach(callback),
    } as any);

    const summary = await getDailyWellnessSummary(mockUserId, today);

    expect(summary.averageMood).toBeCloseTo(3.25);
    expect(summary.averageEnergy).toBe(3);
    expect(summary.insights).toBeDefined();
  });
});
