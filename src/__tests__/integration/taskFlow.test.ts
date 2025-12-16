import {
  createTask,
  getTasks,
  updateTask,
  completeTask,
  deleteTask,
} from '../../services/taskService';
import { CreateTaskInput } from '../../types/task';
import { addDoc, getDocs, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';

jest.mock('../../services/firebase/config', () => ({
  db: {},
}));

jest.mock('firebase/firestore');

const mockAddDoc = addDoc as jest.MockedFunction<typeof addDoc>;
const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
const mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>;
const mockDeleteDoc = deleteDoc as jest.MockedFunction<typeof deleteDoc>;
const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;

describe('Task Flow Integration Tests', () => {
  const mockUserId = 'integration-test-user';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should complete full task lifecycle: create -> update -> complete -> delete', async () => {
    // Step 1: Create a task
    const taskInput: CreateTaskInput = {
      title: 'Integration Test Task',
      description: 'Testing the full lifecycle',
      category: 'work',
      urgency: 'high',
      tags: ['test'],
    };

    const mockTaskId = 'integration-task-1';
    mockAddDoc.mockResolvedValue({ id: mockTaskId } as any);

    const mockCreatedTask = {
      exists: () => true,
      id: mockTaskId,
      data: () => ({
        taskId: mockTaskId,
        userId: mockUserId,
        ...taskInput,
        status: 'pending',
        urgencySource: 'user',
        createdAt: { toDate: () => new Date() },
        updatedAt: { toDate: () => new Date() },
      }),
    };

    mockGetDoc.mockResolvedValueOnce(mockCreatedTask as any);

    const createdTask = await createTask(mockUserId, taskInput);

    expect(createdTask.taskId).toBe(mockTaskId);
    expect(createdTask.title).toBe('Integration Test Task');
    expect(createdTask.status).toBe('pending');

    // Step 2: Update the task
    mockUpdateDoc.mockResolvedValue(undefined);

    await updateTask(mockTaskId, {
      title: 'Updated Integration Test Task',
      status: 'in-progress',
    });

    expect(mockUpdateDoc).toHaveBeenCalled();

    // Step 3: Complete the task
    const mockUpdatedTask = {
      exists: () => true,
      id: mockTaskId,
      data: () => ({
        taskId: mockTaskId,
        userId: mockUserId,
        title: 'Updated Integration Test Task',
        status: 'in-progress',
        category: 'work',
        urgency: 'high',
        urgencySource: 'user',
        createdAt: { toDate: () => new Date() },
        updatedAt: { toDate: () => new Date() },
      }),
    };

    mockGetDoc.mockResolvedValueOnce(mockUpdatedTask as any);

    await completeTask(mockTaskId);

    expect(mockUpdateDoc).toHaveBeenCalled();

    // Step 4: Delete the task
    mockDeleteDoc.mockResolvedValue(undefined);

    await deleteTask(mockTaskId);

    expect(mockDeleteDoc).toHaveBeenCalled();
  });

  it('should handle task with subtasks lifecycle', async () => {
    const taskWithSubtasks: CreateTaskInput = {
      title: 'Task with Subtasks',
      category: 'personal',
      urgency: 'medium',
      subtasks: [
        {
          subtaskId: 'sub-1',
          title: 'Subtask 1',
          completed: false,
          completedAt: null,
          createdAt: new Date(),
        },
        {
          subtaskId: 'sub-2',
          title: 'Subtask 2',
          completed: false,
          completedAt: null,
          createdAt: new Date(),
        },
      ],
    };

    const mockTaskId = 'task-with-subtasks';
    mockAddDoc.mockResolvedValue({ id: mockTaskId } as any);

    const mockTask = {
      exists: () => true,
      id: mockTaskId,
      data: () => ({
        taskId: mockTaskId,
        userId: mockUserId,
        ...taskWithSubtasks,
        status: 'pending',
        urgencySource: 'user',
        createdAt: { toDate: () => new Date() },
        updatedAt: { toDate: () => new Date() },
        subtasks: taskWithSubtasks.subtasks?.map((st) => ({
          ...st,
          createdAt: { toDate: () => st.createdAt },
        })),
      }),
    };

    mockGetDoc.mockResolvedValue(mockTask as any);

    const createdTask = await createTask(mockUserId, taskWithSubtasks);

    expect(createdTask.subtasks).toHaveLength(2);
    expect(createdTask.subtasks![0].completed).toBe(false);

    // Update first subtask to completed
    mockUpdateDoc.mockResolvedValue(undefined);

    await updateTask(mockTaskId, {
      subtasks: [
        {
          subtaskId: 'sub-1',
          title: 'Subtask 1',
          completed: true,
          completedAt: new Date(),
          createdAt: new Date(),
        },
        {
          subtaskId: 'sub-2',
          title: 'Subtask 2',
          completed: false,
          completedAt: null,
          createdAt: new Date(),
        },
      ],
    });

    expect(mockUpdateDoc).toHaveBeenCalled();
  });

  it('should handle filtering tasks by status', async () => {
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
          urgencySource: 'user',
          createdAt: { toDate: () => new Date() },
          updatedAt: { toDate: () => new Date() },
        }),
      },
      {
        id: 'task-2',
        data: () => ({
          taskId: 'task-2',
          userId: mockUserId,
          title: 'In Progress Task',
          status: 'in-progress',
          category: 'work',
          urgency: 'medium',
          urgencySource: 'user',
          createdAt: { toDate: () => new Date() },
          updatedAt: { toDate: () => new Date() },
        }),
      },
    ];

    mockGetDocs.mockResolvedValue({
      forEach: (callback: any) => mockTasks.forEach(callback),
    } as any);

    const allTasks = await getTasks(mockUserId);
    expect(allTasks).toHaveLength(2);

    // Filter for pending tasks only
    mockGetDocs.mockResolvedValue({
      forEach: (callback: any) => [mockTasks[0]].forEach(callback),
    } as any);

    const pendingTasks = await getTasks(mockUserId, { status: 'pending' });
    expect(pendingTasks).toHaveLength(1);
    expect(pendingTasks[0].status).toBe('pending');
  });

  it('should handle task with recurring pattern', async () => {
    const recurringTask: CreateTaskInput = {
      title: 'Recurring Task',
      category: 'personal',
      urgency: 'medium',
      isRecurring: true,
      recurrenceRule: {
        frequency: 'daily',
        interval: 1,
        endDate: new Date('2025-12-31'),
      },
    };

    const mockTaskId = 'recurring-task';
    mockAddDoc.mockResolvedValue({ id: mockTaskId } as any);

    const mockTask = {
      exists: () => true,
      id: mockTaskId,
      data: () => ({
        taskId: mockTaskId,
        userId: mockUserId,
        ...recurringTask,
        status: 'pending',
        urgencySource: 'user',
        createdAt: { toDate: () => new Date() },
        updatedAt: { toDate: () => new Date() },
        recurrenceRule: {
          ...recurringTask.recurrenceRule,
          endDate: { toDate: () => recurringTask.recurrenceRule!.endDate },
        },
      }),
    };

    mockGetDoc.mockResolvedValue(mockTask as any);

    const createdTask = await createTask(mockUserId, recurringTask);

    expect(createdTask.isRecurring).toBe(true);
    expect(createdTask.recurrenceRule).toBeDefined();
    expect(createdTask.recurrenceRule!.frequency).toBe('daily');
  });
});
