import { create } from 'zustand';
import { User } from '../types';

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  loading: true,
  error: null,

  setUser: (user) => set({ user, error: null }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  clearUser: () => set({ user: null, error: null }),
}));
