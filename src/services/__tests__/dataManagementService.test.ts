import {
  collection,
  query,
  where,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import {
  clearCompletedTasks,
  clearArchivedTasks,
  resetUrgencyLearning,
  clearWellnessHistory,
  getUserDataStats,
} from '../dataManagementService';

jest.mock('../firebase/config', () => ({
  db: {},
}));

jest.mock('firebase/firestore');

const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
const mockWriteBatch = writeBatch as jest.MockedFunction<typeof writeBatch>;

describe('dataManagementService', () => {
  const mockUserId = 'test-user-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('clearCompletedTasks', () => {
    it('should clear all completed tasks', async () => {
      const mockTasks = [
        { id: 'task-1', ref: {} },
        { id: 'task-2', ref: {} },
      ];

      mockGetDocs.mockResolvedValue({
        size: 2,
        forEach: (callback: any) => mockTasks.forEach(callback),
      } as any);

      const mockBatch = {
        delete: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined),
      };

      mockWriteBatch.mockReturnValue(mockBatch as any);

      const result = await clearCompletedTasks(mockUserId);

      expect(result).toBe(2);
      expect(mockBatch.delete).toHaveBeenCalledTimes(2);
      expect(mockBatch.commit).toHaveBeenCalled();
    });

    it('should handle errors when clearing tasks', async () => {
      mockGetDocs.mockRejectedValue(new Error('Firestore error'));

      await expect(clearCompletedTasks(mockUserId)).rejects.toThrow('Firestore error');
    });
  });

  describe('clearArchivedTasks', () => {
    it('should clear all archived tasks', async () => {
      const mockTasks = [{ id: 'task-1', ref: {} }];

      mockGetDocs.mockResolvedValue({
        size: 1,
        forEach: (callback: any) => mockTasks.forEach(callback),
      } as any);

      const mockBatch = {
        delete: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined),
      };

      mockWriteBatch.mockReturnValue(mockBatch as any);

      const result = await clearArchivedTasks(mockUserId);

      expect(result).toBe(1);
      expect(mockBatch.commit).toHaveBeenCalled();
    });
  });

  describe('resetUrgencyLearning', () => {
    it('should reset urgency patterns', async () => {
      const mockPatterns = [
        { id: 'pattern-1', ref: {} },
        { id: 'pattern-2', ref: {} },
        { id: 'pattern-3', ref: {} },
      ];

      mockGetDocs.mockResolvedValue({
        size: 3,
        forEach: (callback: any) => mockPatterns.forEach(callback),
      } as any);

      const mockBatch = {
        delete: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined),
      };

      mockWriteBatch.mockReturnValue(mockBatch as any);

      const result = await resetUrgencyLearning(mockUserId);

      expect(result).toBe(3);
      expect(mockBatch.delete).toHaveBeenCalledTimes(3);
    });
  });

  describe('clearWellnessHistory', () => {
    it('should clear all wellness check-ins', async () => {
      const mockCheckIns = Array.from({ length: 10 }, (_, i) => ({
        id: `checkin-${i}`,
        ref: {},
      }));

      mockGetDocs.mockResolvedValue({
        size: 10,
        forEach: (callback: any) => mockCheckIns.forEach(callback),
      } as any);

      const mockBatch = {
        delete: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined),
      };

      mockWriteBatch.mockReturnValue(mockBatch as any);

      const result = await clearWellnessHistory(mockUserId);

      expect(result).toBe(10);
      expect(mockBatch.delete).toHaveBeenCalledTimes(10);
    });
  });

  describe('getUserDataStats', () => {
    it('should calculate user data statistics', async () => {
      const mockTasks = [
        { id: 'task-1', data: () => ({ status: 'pending' }) },
        { id: 'task-2', data: () => ({ status: 'pending' }) },
        { id: 'task-3', data: () => ({ status: 'completed' }) },
        { id: 'task-4', data: () => ({ status: 'in-progress' }) },
      ];

      const mockWellness = Array.from({ length: 15 }, (_, i) => ({
        id: `wellness-${i}`,
      }));

      const mockPatterns = Array.from({ length: 5 }, (_, i) => ({
        id: `pattern-${i}`,
      }));

      mockGetDocs
        .mockResolvedValueOnce({
          size: 4,
          forEach: (callback: any) => mockTasks.forEach(callback),
        } as any)
        .mockResolvedValueOnce({
          size: 15,
          forEach: () => {},
        } as any)
        .mockResolvedValueOnce({
          size: 5,
          forEach: () => {},
        } as any);

      const stats = await getUserDataStats(mockUserId);

      expect(stats.totalTasks).toBe(4);
      expect(stats.tasksByStatus.pending).toBe(2);
      expect(stats.tasksByStatus.completed).toBe(1);
      expect(stats.tasksByStatus['in-progress']).toBe(1);
      expect(stats.totalWellnessCheckIns).toBe(15);
      expect(stats.totalUrgencyPatterns).toBe(5);
    });
  });
});
