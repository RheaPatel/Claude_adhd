import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase/config';
import { COLLECTIONS } from './firebase/firestore';

/**
 * Clear all completed tasks for a user
 */
export const clearCompletedTasks = async (userId: string): Promise<number> => {
  try {
    const tasksRef = collection(db, COLLECTIONS.TASKS);
    const q = query(
      tasksRef,
      where('userId', '==', userId),
      where('status', '==', 'completed')
    );

    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);

    querySnapshot.forEach((taskDoc) => {
      batch.delete(taskDoc.ref);
    });

    await batch.commit();
    return querySnapshot.size;
  } catch (error) {
    console.error('Error clearing completed tasks:', error);
    throw error;
  }
};

/**
 * Clear all archived tasks for a user
 */
export const clearArchivedTasks = async (userId: string): Promise<number> => {
  try {
    const tasksRef = collection(db, COLLECTIONS.TASKS);
    const q = query(
      tasksRef,
      where('userId', '==', userId),
      where('status', '==', 'archived')
    );

    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);

    querySnapshot.forEach((taskDoc) => {
      batch.delete(taskDoc.ref);
    });

    await batch.commit();
    return querySnapshot.size;
  } catch (error) {
    console.error('Error clearing archived tasks:', error);
    throw error;
  }
};

/**
 * Reset urgency learning patterns for a user
 */
export const resetUrgencyLearning = async (userId: string): Promise<number> => {
  try {
    const patternsRef = collection(db, COLLECTIONS.URGENCY_PATTERNS);
    const q = query(patternsRef, where('userId', '==', userId));

    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);

    querySnapshot.forEach((patternDoc) => {
      batch.delete(patternDoc.ref);
    });

    await batch.commit();
    return querySnapshot.size;
  } catch (error) {
    console.error('Error resetting urgency learning:', error);
    throw error;
  }
};

/**
 * Clear all wellness check-ins for a user
 */
export const clearWellnessHistory = async (userId: string): Promise<number> => {
  try {
    const checkInsRef = collection(db, COLLECTIONS.WELLNESS_CHECKINS);
    const q = query(checkInsRef, where('userId', '==', userId));

    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);

    querySnapshot.forEach((checkInDoc) => {
      batch.delete(checkInDoc.ref);
    });

    await batch.commit();
    return querySnapshot.size;
  } catch (error) {
    console.error('Error clearing wellness history:', error);
    throw error;
  }
};

/**
 * Export user tasks as JSON
 */
export const exportTasksAsJSON = async (userId: string): Promise<string> => {
  try {
    const tasksRef = collection(db, COLLECTIONS.TASKS);
    const q = query(tasksRef, where('userId', '==', userId));

    const querySnapshot = await getDocs(q);
    const tasks = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return JSON.stringify(tasks, null, 2);
  } catch (error) {
    console.error('Error exporting tasks:', error);
    throw error;
  }
};

/**
 * Export user wellness data as JSON
 */
export const exportWellnessAsJSON = async (userId: string): Promise<string> => {
  try {
    const checkInsRef = collection(db, COLLECTIONS.WELLNESS_CHECKINS);
    const q = query(checkInsRef, where('userId', '==', userId));

    const querySnapshot = await getDocs(q);
    const checkIns = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return JSON.stringify(checkIns, null, 2);
  } catch (error) {
    console.error('Error exporting wellness data:', error);
    throw error;
  }
};

/**
 * Get data statistics for a user
 */
export const getUserDataStats = async (userId: string) => {
  try {
    const [tasks, wellness, patterns] = await Promise.all([
      getDocs(query(collection(db, COLLECTIONS.TASKS), where('userId', '==', userId))),
      getDocs(query(collection(db, COLLECTIONS.WELLNESS_CHECKINS), where('userId', '==', userId))),
      getDocs(query(collection(db, COLLECTIONS.URGENCY_PATTERNS), where('userId', '==', userId))),
    ]);

    const tasksByStatus = {
      pending: 0,
      'in-progress': 0,
      completed: 0,
      archived: 0,
    };

    tasks.forEach((doc) => {
      const task = doc.data();
      tasksByStatus[task.status as keyof typeof tasksByStatus]++;
    });

    return {
      totalTasks: tasks.size,
      tasksByStatus,
      totalWellnessCheckIns: wellness.size,
      totalUrgencyPatterns: patterns.size,
    };
  } catch (error) {
    console.error('Error getting user data stats:', error);
    throw error;
  }
};
