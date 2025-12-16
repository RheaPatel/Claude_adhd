import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase/config';
import { COLLECTIONS } from './firebase/firestore';
import { Task, TaskDocument, CreateTaskInput, UpdateTaskInput, TaskFilters } from '../types';

/**
 * Convert Firestore TaskDocument to Task
 */
const taskDocumentToTask = (doc: TaskDocument): Task => {
  return {
    ...doc,
    dueDate: doc.dueDate?.toDate(),
    reminderTimes: doc.reminderTimes?.map((t) => t.toDate()),
    completedAt: doc.completedAt?.toDate(),
    createdAt: doc.createdAt.toDate(),
    updatedAt: doc.updatedAt.toDate(),
  };
};

/**
 * Convert Task to Firestore TaskDocument
 */
const taskToTaskDocument = (task: Partial<Task>): Partial<TaskDocument> => {
  const doc: any = { ...task };

  if (task.dueDate) {
    doc.dueDate = Timestamp.fromDate(task.dueDate);
  }

  if (task.reminderTimes) {
    doc.reminderTimes = task.reminderTimes.map((t) => Timestamp.fromDate(t));
  }

  if (task.completedAt) {
    doc.completedAt = Timestamp.fromDate(task.completedAt);
  }

  return doc;
};

/**
 * Get all tasks for a user
 */
export const getTasks = async (userId: string, filters?: TaskFilters): Promise<Task[]> => {
  try {
    const tasksRef = collection(db, COLLECTIONS.TASKS);
    let q = query(tasksRef, where('userId', '==', userId));

    // Apply filters
    if (filters?.status) {
      q = query(q, where('status', '==', filters.status));
    }

    if (filters?.category) {
      q = query(q, where('category', '==', filters.category));
    }

    if (filters?.urgency) {
      q = query(q, where('urgency', '==', filters.urgency));
    }

    // Order by creation date (newest first)
    q = query(q, orderBy('createdAt', 'desc'));

    const querySnapshot = await getDocs(q);
    const tasks: Task[] = [];

    querySnapshot.forEach((doc) => {
      const taskDoc = { ...doc.data(), taskId: doc.id } as TaskDocument;
      tasks.push(taskDocumentToTask(taskDoc));
    });

    return tasks;
  } catch (error) {
    console.error('Error getting tasks:', error);
    throw error;
  }
};

/**
 * Get a single task by ID
 */
export const getTask = async (taskId: string): Promise<Task | null> => {
  try {
    const taskRef = doc(db, COLLECTIONS.TASKS, taskId);
    const taskSnap = await getDoc(taskRef);

    if (!taskSnap.exists()) {
      return null;
    }

    const taskDoc = { ...taskSnap.data(), taskId: taskSnap.id } as TaskDocument;
    return taskDocumentToTask(taskDoc);
  } catch (error) {
    console.error('Error getting task:', error);
    throw error;
  }
};

/**
 * Create a new task
 */
export const createTask = async (userId: string, input: CreateTaskInput): Promise<Task> => {
  try {
    const tasksRef = collection(db, COLLECTIONS.TASKS);

    const taskData: any = {
      userId,
      title: input.title,
      description: input.description || '',
      category: input.category || 'other',
      urgency: input.urgency || 'medium',
      urgencySource: 'user',
      status: 'pending',
      tags: input.tags || [],
      isLongTerm: input.isLongTerm || false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Only add dueDate if it exists
    if (input.dueDate) {
      taskData.dueDate = Timestamp.fromDate(input.dueDate);
    }

    // Only add reminderTimes if it exists
    if (input.reminderTimes && input.reminderTimes.length > 0) {
      taskData.reminderTimes = input.reminderTimes.map((t) => Timestamp.fromDate(t));
    }

    const docRef = await addDoc(tasksRef, taskData);

    // Fetch the created document to get server-generated timestamps
    const createdTask = await getTask(docRef.id);

    if (!createdTask) {
      throw new Error('Failed to retrieve created task');
    }

    return createdTask;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

/**
 * Update an existing task
 */
export const updateTask = async (taskId: string, updates: UpdateTaskInput): Promise<void> => {
  try {
    const taskRef = doc(db, COLLECTIONS.TASKS, taskId);

    const updateData: any = {
      ...updates,
      ...taskToTaskDocument(updates as Partial<Task>),
      updatedAt: serverTimestamp(),
    };

    // Remove undefined values
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    await updateDoc(taskRef, updateData);
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

/**
 * Delete a task
 */
export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    const taskRef = doc(db, COLLECTIONS.TASKS, taskId);
    await deleteDoc(taskRef);
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

/**
 * Mark a task as completed
 */
export const completeTask = async (taskId: string): Promise<void> => {
  try {
    const task = await getTask(taskId);

    if (!task) {
      throw new Error('Task not found');
    }

    // Calculate time to completion (in days)
    const now = new Date();
    const timeToCompletion = Math.floor(
      (now.getTime() - task.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    await updateTask(taskId, {
      status: 'completed',
      actualDuration: task.estimatedDuration, // Can be updated with actual tracking later
    });

    // Update with completion metadata
    const taskRef = doc(db, COLLECTIONS.TASKS, taskId);
    await updateDoc(taskRef, {
      completedAt: serverTimestamp(),
      timeToCompletion,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error completing task:', error);
    throw error;
  }
};

/**
 * Archive a task
 */
export const archiveTask = async (taskId: string): Promise<void> => {
  try {
    await updateTask(taskId, {
      status: 'archived',
    });
  } catch (error) {
    console.error('Error archiving task:', error);
    throw error;
  }
};
