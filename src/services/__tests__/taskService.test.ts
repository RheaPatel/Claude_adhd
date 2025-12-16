import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  completeTask,
  archiveTask,
} from '../taskService';
import { CreateTaskInput, Task } from '../../types/task';

// Mock Firebase
jest.mock('../firebase/config', () => ({
  db: {},
}));

jest.mock('firebase/firestore');

const mockCollection = collection as jest.MockedFunction<typeof collection>;
const mockAddDoc = addDoc as jest.MockedFunction<typeof addDoc>;
const mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>;
const mockDeleteDoc = deleteDoc as jest.MockedFunction<typeof deleteDoc>;
const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;
const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
const mockDoc = doc as jest.MockedFunction<typeof doc>;

describe('taskService', () => {
  const mockUserId = 'test-user-id';
  const mockTaskId = 'test-task-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    it('should create a task with minimum required fields', async () => {
      const input: CreateTaskInput = {
        title: 'Test Task',
        category: 'work',
        urgency: 'high',
      };

      const mockDocRef = { id: mockTaskId };
      mockAddDoc.mockResolvedValue(mockDocRef as any);

      const mockTaskDoc = {
        exists: () => true,
        id: mockTaskId,
        data: () => ({
          userId: mockUserId,
          title: 'Test Task',
          category: 'work',
          urgency: 'high',
          status: 'pending',
          createdAt: { toDate: () => new Date() },
          updatedAt: { toDate: () => new Date() },
        }),
      };

      mockGetDoc.mockResolvedValue(mockTaskDoc as any);

      const result = await createTask(mockUserId, input);

      expect(mockAddDoc).toHaveBeenCalled();
      expect(result).toHaveProperty('taskId', mockTaskId);
      expect(result.title).toBe('Test Task');
      expect(result.category).toBe('work');
      expect(result.urgency).toBe('high');
    });

    it('should create a task with all optional fields', async () => {
      const input: CreateTaskInput = {
        title: 'Complete Task',
        description: 'Task description',
        category: 'personal',
        urgency: 'medium',
        dueDate: new Date('2025-12-31'),
        isLongTerm: true,
        tags: ['important', 'urgent'],
        subtasks: [
          {
            subtaskId: 'sub-1',
            title: 'Subtask 1',
            completed: false,
            completedAt: null,
            createdAt: new Date(),
          },
        ],
      };

      const mockDocRef = { id: mockTaskId };
      mockAddDoc.mockResolvedValue(mockDocRef as any);

      const mockTaskDoc = {
        exists: () => true,
        id: mockTaskId,
        data: () => ({
          ...input,
          userId: mockUserId,
          status: 'pending',
          createdAt: { toDate: () => new Date() },
          updatedAt: { toDate: () => new Date() },
          dueDate: { toDate: () => input.dueDate },
          subtasks: input.subtasks?.map((st) => ({
            ...st,
            createdAt: { toDate: () => st.createdAt },
          })),
        }),
      };

      mockGetDoc.mockResolvedValue(mockTaskDoc as any);

      const result = await createTask(mockUserId, input);

      expect(result.description).toBe('Task description');
      expect(result.isLongTerm).toBe(true);
      expect(result.tags).toEqual(['important', 'urgent']);
      expect(result.subtasks).toHaveLength(1);
    });

    it('should handle errors when creating a task', async () => {
      mockAddDoc.mockRejectedValue(new Error('Firestore error'));

      const input: CreateTaskInput = {
        title: 'Test Task',
        category: 'work',
        urgency: 'high',
      };

      await expect(createTask(mockUserId, input)).rejects.toThrow('Firestore error');
    });
  });

  describe('getTasks', () => {
    it('should retrieve all tasks for a user', async () => {
      const mockTasks = [
        {
          id: 'task-1',
          data: () => ({
            taskId: 'task-1',
            userId: mockUserId,
            title: 'Task 1',
            status: 'pending',
            category: 'work',
            urgency: 'high',
            createdAt: { toDate: () => new Date() },
            updatedAt: { toDate: () => new Date() },
          }),
        },
        {
          id: 'task-2',
          data: () => ({
            taskId: 'task-2',
            userId: mockUserId,
            title: 'Task 2',
            status: 'completed',
            category: 'personal',
            urgency: 'low',
            createdAt: { toDate: () => new Date() },
            updatedAt: { toDate: () => new Date() },
          }),
        },
      ];

      mockGetDocs.mockResolvedValue({
        forEach: (callback: any) => mockTasks.forEach(callback),
      } as any);

      const result = await getTasks(mockUserId);

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Task 1');
      expect(result[1].title).toBe('Task 2');
    });

    it('should filter tasks by status', async () => {
      const mockTasks = [
        {
          id: 'task-1',
          data: () => ({
            taskId: 'task-1',
            userId: mockUserId,
            title: 'Pending Task',
            status: 'pending',
            category: 'work',
            urgency: 'high',
            createdAt: { toDate: () => new Date() },
            updatedAt: { toDate: () => new Date() },
          }),
        },
      ];

      mockGetDocs.mockResolvedValue({
        forEach: (callback: any) => mockTasks.forEach(callback),
      } as any);

      const result = await getTasks(mockUserId, { status: 'pending' });

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('pending');
    });
  });

  describe('updateTask', () => {
    it('should update task fields', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      await updateTask(mockTaskId, {
        title: 'Updated Title',
        status: 'in-progress',
      });

      expect(mockUpdateDoc).toHaveBeenCalled();
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      mockDeleteDoc.mockResolvedValue(undefined);

      await deleteTask(mockTaskId);

      expect(mockDeleteDoc).toHaveBeenCalled();
    });
  });

  describe('completeTask', () => {
    it('should mark a task as completed', async () => {
      const mockTask: Partial<Task> = {
        taskId: mockTaskId,
        userId: mockUserId,
        title: 'Test Task',
        status: 'pending',
        category: 'work',
        urgency: 'high',
        urgencySource: 'user',
        createdAt: new Date('2025-12-01'),
        updatedAt: new Date(),
      };

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        id: mockTaskId,
        data: () => ({
          ...mockTask,
          createdAt: { toDate: () => mockTask.createdAt },
          updatedAt: { toDate: () => mockTask.updatedAt },
        }),
      } as any);

      mockUpdateDoc.mockResolvedValue(undefined);

      await completeTask(mockTaskId);

      expect(mockUpdateDoc).toHaveBeenCalled();
    });

    it('should throw error if task not found', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      } as any);

      await expect(completeTask(mockTaskId)).rejects.toThrow('Task not found');
    });
  });

  describe('archiveTask', () => {
    it('should archive a task', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      await archiveTask(mockTaskId);

      expect(mockUpdateDoc).toHaveBeenCalled();
    });
  });
});
