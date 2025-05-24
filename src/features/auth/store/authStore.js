
// ✅ src/features/auth/store/authStore.js

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      role: null,
      profile: null,

      login: ({ token, role, profile }) => set({ token, role, profile }),

      logout: () => set({ token: null, role: null, profile: null }),

      isLoggedIn: () => !!localStorage.getItem('token'),
      
    }),
    {
      name: 'auth-storage', // 🔐 key ใน localStorage
    }
  )
);