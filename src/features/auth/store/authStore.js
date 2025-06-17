// ✅ src/features/auth/store/authStore.js

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { loginUser } from '../api/auth';


export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      role: null,
      profile: null,

      login: ({ token, role, profile }) => set({ token, role, profile }),

      logout: () => set({ token: null, role: null, profile: null }),

      isLoggedIn: () => !!localStorage.getItem('token'),

      // ✅ เพิ่ม loginAction ที่เรียก loginUser API
      loginAction: async (credentials) => {
        try {
          const res = await loginUser(credentials); // 🔗 API call
          set({
            token: res.token,
            role: res.role,
            profile: res.profile,
          });
          return res;
        } catch (err) {
          console.error("❌ loginAction error:", err);
          throw err;
        }
      },
    }),
    {
      name: 'auth-storage', // 🔐 key ใน localStorage
    }
  )
);
