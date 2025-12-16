import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import {
  logWellnessCheckIn,
  getWellnessCheckIns,
  getTodayWellnessCheckIns,
  getDailyWellnessSummary,
  getWeeklyWellnessTrends,
} from '../wellnessService';
import { startOfDay, endOfDay } from 'date-fns';

jest.mock('../firebase/config', () => ({
  db: {},
}));

jest.mock('firebase/firestore');

const mockAddDoc = addDoc as jest.MockedFunction<typeof addDoc>;
const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;

describe('wellnessService', () => {
  const mockUserId = 'test-user-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('logWellnessCheckIn', () => {
    it('should log a hydration check-in', async () => {
      const mockDocRef = { id: 'checkin-1' };
      mockAddDoc.mockResolvedValue(mockDocRef as any);

      const result = await logWellnessCheckIn(mockUserId, 'hydration');

      expect(mockAddDoc).toHaveBeenCalled();
      expect(result.type).toBe('hydration');
      expect(result.userId).toBe(mockUserId);
    });

    it('should log a check-in with mood and energy', async () => {
      const mockDocRef = { id: 'checkin-2' };
      mockAddDoc.mockResolvedValue(mockDocRef as any);

      const result = await logWellnessCheckIn(mockUserId, 'meal', {
        mood: 4,
        energy: 3,
        notes: 'Feeling good',
      });

      expect(result.mood).toBe(4);
      expect(result.energy).toBe(3);
      expect(result.notes).toBe('Feeling good');
    });

    it('should handle errors when logging check-in', async () => {
      mockAddDoc.mockRejectedValue(new Error('Firestore error'));

      await expect(logWellnessCheckIn(mockUserId, 'hydration')).rejects.toThrow(
        'Firestore error'
      );
    });
  });

  describe('getWellnessCheckIns', () => {
    it('should retrieve check-ins for a date range', async () => {
      const mockCheckIns = [
        {
          id: 'checkin-1',
          data: () => ({
            checkInId: 'checkin-1',
            userId: mockUserId,
            type: 'hydration',
            timestamp: { toDate: () => new Date() },
            createdAt: { toDate: () => new Date() },
          }),
        },
        {
          id: 'checkin-2',
          data: () => ({
            checkInId: 'checkin-2',
            userId: mockUserId,
            type: 'meal',
            timestamp: { toDate: () => new Date() },
            createdAt: { toDate: () => new Date() },
          }),
        },
      ];

      mockGetDocs.mockResolvedValue({
        forEach: (callback: any) => mockCheckIns.forEach(callback),
      } as any);

      const startDate = new Date('2025-12-01');
      const endDate = new Date('2025-12-31');

      const result = await getWellnessCheckIns(mockUserId, startDate, endDate);

      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('hydration');
      expect(result[1].type).toBe('meal');
    });
  });

  describe('getDailyWellnessSummary', () => {
    it('should calculate daily summary with check-ins', async () => {
      const today = new Date();
      const mockCheckIns = [
        {
          id: 'h1',
          data: () => ({
            checkInId: 'h1',
            userId: mockUserId,
            type: 'hydration',
            mood: 4,
            energy: 3,
            timestamp: { toDate: () => today },
            createdAt: { toDate: () => today },
          }),
        },
        {
          id: 'h2',
          data: () => ({
            checkInId: 'h2',
            userId: mockUserId,
            type: 'hydration',
            timestamp: { toDate: () => today },
            createdAt: { toDate: () => today },
          }),
        },
        {
          id: 'm1',
          data: () => ({
            checkInId: 'm1',
            userId: mockUserId,
            type: 'meal',
            mood: 5,
            energy: 4,
            timestamp: { toDate: () => today },
            createdAt: { toDate: () => today },
          }),
        },
      ];

      mockGetDocs.mockResolvedValue({
        forEach: (callback: any) => mockCheckIns.forEach(callback),
      } as any);

      const summary = await getDailyWellnessSummary(mockUserId, today);

      expect(summary.hydrationCompleted).toBe(2);
      expect(summary.mealsCompleted).toBe(1);
      expect(summary.averageMood).toBeCloseTo(4.5);
      expect(summary.averageEnergy).toBeCloseTo(3.5);
      expect(summary.insights).toBeDefined();
      expect(summary.insights!.length).toBeGreaterThan(0);
    });

    it('should return empty summary with no check-ins', async () => {
      mockGetDocs.mockResolvedValue({
        forEach: () => {},
      } as any);

      const summary = await getDailyWellnessSummary(mockUserId, new Date());

      expect(summary.hydrationCompleted).toBe(0);
      expect(summary.mealsCompleted).toBe(0);
      expect(summary.breaksCompleted).toBe(0);
      expect(summary.averageMood).toBeUndefined();
    });

    it('should generate insights for good hydration', async () => {
      const today = new Date();
      const mockCheckIns = Array.from({ length: 8 }, (_, i) => ({
        id: `h${i}`,
        data: () => ({
          checkInId: `h${i}`,
          userId: mockUserId,
          type: 'hydration',
          timestamp: { toDate: () => today },
          createdAt: { toDate: () => today },
        }),
      }));

      mockGetDocs.mockResolvedValue({
        forEach: (callback: any) => mockCheckIns.forEach(callback),
      } as any);

      const summary = await getDailyWellnessSummary(mockUserId, today);

      expect(summary.insights).toContain('Great hydration today! 💧');
    });

    it('should generate insights for low hydration', async () => {
      const today = new Date();
      const mockCheckIns = [
        {
          id: 'h1',
          data: () => ({
            checkInId: 'h1',
            userId: mockUserId,
            type: 'hydration',
            timestamp: { toDate: () => today },
            createdAt: { toDate: () => today },
          }),
        },
      ];

      mockGetDocs.mockResolvedValue({
        forEach: (callback: any) => mockCheckIns.forEach(callback),
      } as any);

      const summary = await getDailyWellnessSummary(mockUserId, today);

      expect(summary.insights).toContain('Remember to drink more water 💧');
    });
  });

  describe('getWeeklyWellnessTrends', () => {
    it('should calculate weekly trends', async () => {
      const mockCheckIns = Array.from({ length: 7 }, (_, day) => ({
        id: `checkin-${day}`,
        data: () => ({
          checkInId: `checkin-${day}`,
          userId: mockUserId,
          type: 'hydration',
          mood: 4,
          energy: 3,
          timestamp: {
            toDate: () => {
              const date = new Date();
              date.setDate(date.getDate() - day);
              return date;
            },
          },
          createdAt: {
            toDate: () => {
              const date = new Date();
              date.setDate(date.getDate() - day);
              return date;
            },
          },
        }),
      }));

      mockGetDocs.mockResolvedValue({
        forEach: (callback: any) => mockCheckIns.forEach(callback),
      } as any);

      const trends = await getWeeklyWellnessTrends(mockUserId);

      expect(trends.length).toBeGreaterThan(0);
      expect(trends[0]).toHaveProperty('date');
      expect(trends[0]).toHaveProperty('hydration');
      expect(trends[0]).toHaveProperty('averageMood');
    });
  });
});
