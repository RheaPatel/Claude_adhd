import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  User as FirebaseUser,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import { User, UserSettings } from '../../types';

// Default user settings
const DEFAULT_SETTINGS: UserSettings = {
  notificationPreferences: {
    enabled: true,
    taskReminders: true,
    wellnessCheckIns: false, // Start with wellness disabled by default
    contextualReminders: true,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    sound: true,
    vibration: true,
  },
  wellnessCheckIns: {
    hydration: {
      enabled: false,
      frequency: 2, // every 2 hours
      startTime: '08:00',
      endTime: '20:00',
    },
    meals: {
      enabled: false,
      times: ['08:00', '13:00', '19:00'], // breakfast, lunch, dinner
    },
    breaks: {
      enabled: false,
      interval: 25, // Pomodoro: 25 minutes
      workHoursOnly: true,
      workStartTime: '09:00',
      workEndTime: '17:00',
    },
  },
  taskDefaults: {
    autoCategorizationEnabled: true,
    urgencyLearningEnabled: true,
  },
  theme: 'auto',
};

/**
 * Sign up a new user with email and password
 */
export const signUp = async (
  email: string,
  password: string,
  displayName: string
): Promise<User> => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Update display name
    await updateProfile(firebaseUser, { displayName });

    // Create user document in Firestore
    const userData: Omit<User, 'userId'> = {
      email: firebaseUser.email!,
      displayName,
      settings: DEFAULT_SETTINGS,
      createdAt: new Date(),
      lastLoginAt: new Date(),
      deviceTokens: [],
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), {
      ...userData,
      userId: firebaseUser.uid,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });

    // Send verification email
    await sendEmailVerification(firebaseUser);

    return {
      userId: firebaseUser.uid,
      ...userData,
    };
  } catch (error: any) {
    console.error('Error signing up:', error);
    throw new Error(error.message || 'Failed to sign up');
  }
};

/**
 * Sign in with email and password
 */
export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Update last login time
    await updateDoc(doc(db, 'users', firebaseUser.uid), {
      lastLoginAt: serverTimestamp(),
    });

    // Fetch user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

    if (!userDoc.exists()) {
      throw new Error('User data not found');
    }

    const userData = userDoc.data();

    return {
      userId: firebaseUser.uid,
      email: userData.email,
      displayName: userData.displayName,
      photoURL: userData.photoURL,
      settings: userData.settings,
      createdAt: userData.createdAt?.toDate() || new Date(),
      lastLoginAt: new Date(),
      deviceTokens: userData.deviceTokens || [],
    };
  } catch (error: any) {
    console.error('Error signing in:', error);
    throw new Error(error.message || 'Failed to sign in');
  }
};

/**
 * Sign out current user
 */
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    console.error('Error signing out:', error);
    throw new Error(error.message || 'Failed to sign out');
  }
};

/**
 * Send password reset email
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('Error sending password reset email:', error);
    throw new Error(error.message || 'Failed to send reset email');
  }
};

/**
 * Get current user data from Firestore
 */
export const getCurrentUser = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));

    if (!userDoc.exists()) {
      return null;
    }

    const userData = userDoc.data();

    return {
      userId,
      email: userData.email,
      displayName: userData.displayName,
      photoURL: userData.photoURL,
      settings: userData.settings,
      createdAt: userData.createdAt?.toDate() || new Date(),
      lastLoginAt: userData.lastLoginAt?.toDate(),
      deviceTokens: userData.deviceTokens || [],
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  userId: string,
  updates: Partial<Pick<User, 'displayName' | 'photoURL'>>
): Promise<void> => {
  try {
    const firebaseUser = auth.currentUser;

    if (!firebaseUser) {
      throw new Error('No user is currently signed in');
    }

    // Update Firebase Auth profile
    await updateProfile(firebaseUser, updates);

    // Update Firestore document
    await updateDoc(doc(db, 'users', userId), updates);
  } catch (error: any) {
    console.error('Error updating profile:', error);
    throw new Error(error.message || 'Failed to update profile');
  }
};

/**
 * Update user settings
 */
export const updateUserSettings = async (
  userId: string,
  settings: Partial<UserSettings>
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      settings,
    });
  } catch (error: any) {
    console.error('Error updating settings:', error);
    throw new Error(error.message || 'Failed to update settings');
  }
};

/**
 * Register device token for push notifications
 */
export const registerDeviceToken = async (userId: string, token: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const currentTokens = userDoc.data().deviceTokens || [];

      // Only add token if it doesn't already exist
      if (!currentTokens.includes(token)) {
        await updateDoc(userRef, {
          deviceTokens: [...currentTokens, token],
        });
      }
    }
  } catch (error) {
    console.error('Error registering device token:', error);
    throw error;
  }
};

/**
 * Unregister device token
 */
export const unregisterDeviceToken = async (userId: string, token: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const currentTokens = userDoc.data().deviceTokens || [];
      const updatedTokens = currentTokens.filter((t: string) => t !== token);

      await updateDoc(userRef, {
        deviceTokens: updatedTokens,
      });
    }
  } catch (error) {
    console.error('Error unregistering device token:', error);
    throw error;
  }
};
