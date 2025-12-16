import { useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import { useSettingsStore } from '../store/settingsStore';
import {
  signIn as firebaseSignIn,
  signUp as firebaseSignUp,
  signOut as firebaseSignOut,
  onAuthStateChange,
  getCurrentUser,
  registerDeviceToken,
} from '../services/firebase/auth';
import { User } from '../types';

export const useAuth = () => {
  const { user, loading, error, setUser, setLoading, setError, clearUser } = useUserStore();
  const { setSettings, clearSettings } = useSettingsStore();

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, fetch full user data from Firestore
        setLoading(true);
        try {
          const userData = await getCurrentUser(firebaseUser.uid);
          if (userData) {
            setUser(userData);
            setSettings(userData.settings);
          } else {
            clearUser();
            clearSettings();
          }
        } catch (error: any) {
          console.error('Error fetching user data:', error);
          setError(error.message);
        } finally {
          setLoading(false);
        }
      } else {
        // User is signed out
        clearUser();
        clearSettings();
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    setError(null);
    try {
      const userData = await firebaseSignUp(email, password, displayName);
      setUser(userData);
      setSettings(userData.settings);
      return userData;
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const userData = await firebaseSignIn(email, password);
      setUser(userData);
      setSettings(userData.settings);
      return userData;
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);
    try {
      await firebaseSignOut();
      clearUser();
      clearSettings();
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const registerPushToken = async (token: string) => {
    if (user) {
      try {
        await registerDeviceToken(user.userId, token);
      } catch (error: any) {
        console.error('Error registering push token:', error);
      }
    }
  };

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user,
    registerPushToken,
  };
};
