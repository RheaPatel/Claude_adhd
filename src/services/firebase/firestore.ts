import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  QueryConstraint,
  DocumentData,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';

/**
 * Convert Firestore Timestamp to JavaScript Date
 */
export const timestampToDate = (timestamp: Timestamp | undefined): Date | undefined => {
  return timestamp ? timestamp.toDate() : undefined;
};

/**
 * Convert JavaScript Date to Firestore Timestamp
 */
export const dateToTimestamp = (date: Date | undefined): Timestamp | undefined => {
  return date ? Timestamp.fromDate(date) : undefined;
};

/**
 * Generic function to get a document by ID
 */
export const getDocument = async <T extends DocumentData>(
  collectionName: string,
  documentId: string
): Promise<T | null> => {
  try {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }

    return null;
  } catch (error) {
    console.error(`Error getting document from ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Generic function to get multiple documents with query constraints
 */
export const getDocuments = async <T extends DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> => {
  try {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  } catch (error) {
    console.error(`Error getting documents from ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Generic function to create a document
 */
export const createDocument = async <T extends DocumentData>(
  collectionName: string,
  data: T
): Promise<string> => {
  try {
    const collectionRef = collection(db, collectionName);
    const docRef = await addDoc(collectionRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error(`Error creating document in ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Generic function to update a document
 */
export const updateDocument = async <T extends Partial<DocumentData>>(
  collectionName: string,
  documentId: string,
  data: T
): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, documentId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Generic function to delete a document
 */
export const deleteDocument = async (
  collectionName: string,
  documentId: string
): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, documentId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Build query constraints from filters
 */
export const buildQueryConstraints = (filters: {
  field?: string;
  operator?: any;
  value?: any;
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
  limitCount?: number;
}): QueryConstraint[] => {
  const constraints: QueryConstraint[] = [];

  if (filters.field && filters.operator && filters.value !== undefined) {
    constraints.push(where(filters.field, filters.operator, filters.value));
  }

  if (filters.orderByField) {
    constraints.push(orderBy(filters.orderByField, filters.orderDirection || 'asc'));
  }

  if (filters.limitCount) {
    constraints.push(limit(filters.limitCount));
  }

  return constraints;
};

// Collection names as constants
export const COLLECTIONS = {
  USERS: 'users',
  TASKS: 'tasks',
  URGENCY_PATTERNS: 'urgencyPatterns',
  NOTIFICATIONS: 'notifications',
  CONTEXTUAL_EVENTS: 'contextualEvents',
  WELLNESS_CHECKINS: 'wellnessCheckIns',
} as const;
