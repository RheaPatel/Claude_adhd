import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
  limit,
} from 'firebase/firestore';
import { db } from './firebase/config';
import { COLLECTIONS } from './firebase/firestore';
import {
  WellnessCheckInLog,
  WellnessCheckInLogDocument,
  WellnessCheckInType,
  DailyWellnessSummary,
} from '../types/wellness';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';

/**
 * Convert Firestore WellnessCheckInLogDocument to WellnessCheckInLog
 */
const wellnessDocumentToLog = (doc: WellnessCheckInLogDocument): WellnessCheckInLog => {
  return {
    ...doc,
    timestamp: doc.timestamp.toDate(),
    createdAt: doc.createdAt.toDate(),
  };
};

/**
 * Log a wellness check-in
 */
export const logWellnessCheckIn = async (
  userId: string,
  type: WellnessCheckInType,
  data?: {
    mood?: number;
    energy?: number;
    notes?: string;
    tags?: string[];
  }
): Promise<WellnessCheckInLog> => {
  try {
    const checkInsRef = collection(db, COLLECTIONS.WELLNESS_CHECKINS);

    const checkInData = {
      userId,
      type,
      timestamp: serverTimestamp(),
      mood: data?.mood,
      energy: data?.energy,
      notes: data?.notes || '',
      tags: data?.tags || [],
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(checkInsRef, checkInData);

    return {
      checkInId: docRef.id,
      userId,
      type,
      timestamp: new Date(),
      mood: data?.mood,
      energy: data?.energy,
      notes: data?.notes,
      tags: data?.tags,
      createdAt: new Date(),
    };
  } catch (error) {
    console.error('Error logging wellness check-in:', error);
    throw error;
  }
};

/**
 * Get wellness check-ins for a specific date range
 */
export const getWellnessCheckIns = async (
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<WellnessCheckInLog[]> => {
  try {
    const checkInsRef = collection(db, COLLECTIONS.WELLNESS_CHECKINS);
    const q = query(
      checkInsRef,
      where('userId', '==', userId),
      where('timestamp', '>=', Timestamp.fromDate(startDate)),
      where('timestamp', '<=', Timestamp.fromDate(endDate)),
      orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const checkIns: WellnessCheckInLog[] = [];

    querySnapshot.forEach((doc) => {
      const checkInDoc = { ...doc.data(), checkInId: doc.id } as WellnessCheckInLogDocument;
      checkIns.push(wellnessDocumentToLog(checkInDoc));
    });

    return checkIns;
  } catch (error) {
    console.error('Error getting wellness check-ins:', error);
    throw error;
  }
};

/**
 * Get today's wellness check-ins
 */
export const getTodayWellnessCheckIns = async (userId: string): Promise<WellnessCheckInLog[]> => {
  const today = new Date();
  const start = startOfDay(today);
  const end = endOfDay(today);
  return getWellnessCheckIns(userId, start, end);
};

/**
 * Get daily wellness summary
 */
export const getDailyWellnessSummary = async (
  userId: string,
  date: Date
): Promise<DailyWellnessSummary> => {
  const start = startOfDay(date);
  const end = endOfDay(date);
  const checkIns = await getWellnessCheckIns(userId, start, end);

  const hydrationCheckIns = checkIns.filter((c) => c.type === 'hydration');
  const mealCheckIns = checkIns.filter((c) => c.type === 'meal');
  const breakCheckIns = checkIns.filter((c) => c.type === 'break');
  const moodCheckIns = checkIns.filter((c) => c.mood !== undefined);
  const energyCheckIns = checkIns.filter((c) => c.energy !== undefined);

  const averageMood =
    moodCheckIns.length > 0
      ? moodCheckIns.reduce((sum, c) => sum + (c.mood || 0), 0) / moodCheckIns.length
      : undefined;

  const averageEnergy =
    energyCheckIns.length > 0
      ? energyCheckIns.reduce((sum, c) => sum + (c.energy || 0), 0) / energyCheckIns.length
      : undefined;

  // Generate insights
  const insights: string[] = [];

  if (hydrationCheckIns.length >= 8) {
    insights.push('Great hydration today! 💧');
  } else if (hydrationCheckIns.length < 4) {
    insights.push('Remember to drink more water 💧');
  }

  if (mealCheckIns.length >= 3) {
    insights.push('You ate all your meals! 🍎');
  } else if (mealCheckIns.length < 2) {
    insights.push('Don\'t forget to eat regularly 🍽️');
  }

  if (breakCheckIns.length >= 4) {
    insights.push('Good job taking breaks! ☕');
  }

  if (averageMood && averageMood >= 4) {
    insights.push('Your mood has been great today! 😊');
  } else if (averageMood && averageMood < 3) {
    insights.push('Take care of yourself - maybe a break would help 💚');
  }

  if (averageEnergy && averageEnergy < 3) {
    insights.push('Low energy detected - consider rest or a healthy snack ⚡');
  }

  return {
    date,
    hydrationGoal: 8,
    hydrationCompleted: hydrationCheckIns.length,
    mealsGoal: 3,
    mealsCompleted: mealCheckIns.length,
    breaksGoal: 8,
    breaksCompleted: breakCheckIns.length,
    averageMood,
    averageEnergy,
    insights,
  };
};

/**
 * Get wellness trends for the past week
 */
export const getWeeklyWellnessTrends = async (userId: string) => {
  const today = new Date();
  const weekAgo = subDays(today, 7);

  const checkIns = await getWellnessCheckIns(userId, weekAgo, today);

  // Group by date
  const dailyData: { [key: string]: WellnessCheckInLog[] } = {};

  checkIns.forEach((checkIn) => {
    const dateKey = format(checkIn.timestamp, 'yyyy-MM-dd');
    if (!dailyData[dateKey]) {
      dailyData[dateKey] = [];
    }
    dailyData[dateKey].push(checkIn);
  });

  // Calculate daily averages
  const trends = Object.entries(dailyData).map(([date, checkIns]) => {
    const moodCheckIns = checkIns.filter((c) => c.mood !== undefined);
    const energyCheckIns = checkIns.filter((c) => c.energy !== undefined);

    return {
      date: new Date(date),
      hydration: checkIns.filter((c) => c.type === 'hydration').length,
      meals: checkIns.filter((c) => c.type === 'meal').length,
      breaks: checkIns.filter((c) => c.type === 'break').length,
      averageMood: moodCheckIns.length > 0
        ? moodCheckIns.reduce((sum, c) => sum + (c.mood || 0), 0) / moodCheckIns.length
        : undefined,
      averageEnergy: energyCheckIns.length > 0
        ? energyCheckIns.reduce((sum, c) => sum + (c.energy || 0), 0) / energyCheckIns.length
        : undefined,
    };
  });

  return trends.sort((a, b) => a.date.getTime() - b.date.getTime());
};

/**
 * Get recent check-ins by type
 */
export const getRecentCheckInsByType = async (
  userId: string,
  type: WellnessCheckInType,
  limitCount: number = 10
): Promise<WellnessCheckInLog[]> => {
  try {
    const checkInsRef = collection(db, COLLECTIONS.WELLNESS_CHECKINS);
    const q = query(
      checkInsRef,
      where('userId', '==', userId),
      where('type', '==', type),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const checkIns: WellnessCheckInLog[] = [];

    querySnapshot.forEach((doc) => {
      const checkInDoc = { ...doc.data(), checkInId: doc.id } as WellnessCheckInLogDocument;
      checkIns.push(wellnessDocumentToLog(checkInDoc));
    });

    return checkIns;
  } catch (error) {
    console.error('Error getting recent check-ins:', error);
    throw error;
  }
};
