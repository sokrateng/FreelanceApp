import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;

  // Actions
  login: (user: User, token: string, refreshToken: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  updateToken: (token: string) => void;
  getToken: () => string | null;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      _hasHydrated: false,

      login: (user, token, refreshToken) => {
        // Also store in localStorage for API client
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', refreshToken);
        }
        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
        });
      },

      logout: () => {
        // Also clear from localStorage for API client
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
        }
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      setUser: (user) => set({ user }),

      updateToken: (token) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
        }
        set({ token });
      },

      getToken: () => {
        return get().token;
      },

      setHasHydrated: (state) => {
        set({
          _hasHydrated: state,
        });
      },
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        // Mark as hydrated
        try {
          state?.setHasHydrated(true);
          // Sync to localStorage after hydration
          if (state && typeof window !== 'undefined') {
            if (state.token) {
              localStorage.setItem('token', state.token);
            }
            if (state.refreshToken) {
              localStorage.setItem('refreshToken', state.refreshToken);
            }
          }
        } catch (error) {
          // Ignore errors during rehydration
          console.warn('Auth store rehydration error:', error);
        }
      },
    }
  )
);
