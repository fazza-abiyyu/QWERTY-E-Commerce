import { create } from 'zustand';

interface UserAddress {
  province: string;
  city: string;
  district: string;
  detail: string;
}

interface User {
  id: string;
  email: string;
  role: string;
  full_name?: string;
  address?: UserAddress;
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      set({ user: null });
      window.location.href = '/';
    } catch (e) {
      console.error('Logout failed', e);
    }
  },
  checkAuth: async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success) {
        set({ user: data.data });
      } else {
        // Access token expired — try to refresh using the refresh_token cookie
        const refreshRes = await fetch('/api/auth/refresh', { method: 'POST' });
        if (refreshRes.ok) {
          // Retry /me with the new access token
          const retryRes = await fetch('/api/auth/me');
          const retryData = await retryRes.json();
          if (retryData.success) {
            set({ user: retryData.data });
            return;
          }
        }
        set({ user: null });
      }
    } catch {
      set({ user: null });
    }
  }
}));
