// ✅ src/features/auth/store/authStore.js

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { loginUser } from '../api/authApi';
import { useBranchStore } from '@/features/branch/store/branchStore';


export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      role: null,
      profile: null,

      login: ({ token, role, profile }) => set({ token, role, profile }),

      logout: () => set({ token: null, role: null, profile: null }),

      isLoggedIn: () => {
        const state = useAuthStore.getState();
        return !!state.token;
      },

      // ✅ login พร้อมบันทึก token และ profile และตั้งค่าสาขาใน branchStore
      loginAction: async (credentials) => {
        try {
          const res = await loginUser(credentials);
          console.log("✅ loginUser response:", res);

          set({
            token: res.data.token,
            role: res.data.role,
            profile: res.data.profile,
          });

          // ✅ เซตสาขาให้ branchStore ทันทีหลัง login
          const branch = res.data.branch;
          if (branch) {
            useBranchStore.getState().setCurrentBranch(branch);
          }

          console.log('loginAction res.data;', res.data);
          return res.data; // ✅ สำคัญมาก เพื่อให้ LoginForm ได้ token จริง
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
