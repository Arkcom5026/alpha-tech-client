// authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { loginUser } from '../api/authApi';
import { useBranchStore } from '@/features/branch/store/branchStore';
import useProductStore from '@/features/product/store/productStore';


export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      role: null,
      employee: null,
      customer: null,

      setUser: ({ token, role, employee, customer }) => set({ token, role, employee, customer }),

      logout: () => set({ token: null, role: null, employee: null, customer: null }),

      logoutAction: () => {
        set({ token: null, role: null, employee: null, customer: null });
        localStorage.removeItem('auth-storage');
      },

      clearStorage: () => {
        set({ token: null, role: null, employee: null, customer: null });
      },

      isLoggedIn: () => {
        const state = useAuthStore.getState();
        return !!state.token;
      },

      loginAction: async (credentials) => {
        try {
          const res = await loginUser(credentials);
          console.log("✅ loginUser response:", res);

          const profile = res.data.profile;
          const role = res.data.role;

          let branchFull = null;
          let employee = null;
          let customer = null;

          // ✅ ตั้งค่าก่อนเรียก API อื่น
          set({
            token: res.data.token,
            role,
          });

          if (role === 'employee' && profile?.branch) {
            const rawPosition = profile.position?.name;
            const mappedPosition = rawPosition === 'employee' ? 'ผู้ดูแลระบบ' : rawPosition;

            branchFull = await useBranchStore.getState().loadAndSetBranchById(profile.branch.id);

            await useProductStore.getState().fetchDropdownsAction(profile.branch.id);

            employee = {
              id: profile.id,
              name: profile.name,
              phone: profile.phone,
              email: profile.email,
              positionName: mappedPosition || '__NO_POSITION__',
              branchId: profile.branch.id,
            };
          }

          if (role === 'customer') {
            customer = {
              id: profile.id,
              name: profile.name,
              phone: profile.phone,
              email: profile.email,
            };
          }

          // ✅ ตั้งค่าเพิ่มเติมหลังโหลดข้อมูลเรียบร้อย
          set((state) => ({
            ...state,
            employee,
            customer,
          }));

          console.log('✅ loginAction success:', { profile, branchFull });

          return {
            token: res.data.token,
            role,
            profile,
          };
        } catch (err) {
          console.error("❌ loginAction error:", err);
          throw err;
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
