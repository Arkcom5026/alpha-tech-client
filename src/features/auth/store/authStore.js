
// authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { loginUser } from '../api/authApi';
import { useBranchStore } from '@/features/branch/store/branchStore';
import useProductStore from '@/features/product/store/productStore';

// ---------- helpers ----------
const normalizeRole = (r) => {
  const v = (r || '').toString().trim().toLowerCase();
  return v === 'supperadmin' ? 'superadmin' : v; // กันสะกดผิดจาก BE
};
const pickPositionRole = (profile) => normalizeRole(profile?.position?.name); // 'superadmin' | 'admin' | 'employee' | ''

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      role: null,
      isSuperAdmin: false,            // ✅ เพิ่มแฟล็กที่อ่านง่าย
      employee: null,
      customer: null,

      setUser: ({ token, role, employee, customer }) =>
        set({
          token,
          role,
          employee,
          customer,
          isSuperAdmin: normalizeRole(role) === 'superadmin', // ✅ sync แฟล็ก
        }),

      logout: () =>
        set({ token: null, role: null, isSuperAdmin: false, employee: null, customer: null }),

      logoutAction: () => {
        set({ token: null, role: null, isSuperAdmin: false, employee: null, customer: null });
        localStorage.removeItem('auth-storage');
      },

      clearStorage: () => {
        set({ token: null, role: null, isSuperAdmin: false, employee: null, customer: null });
      },

      isLoggedIn: () => {
        const state = useAuthStore.getState();
        return !!state.token;
      },

      // ---------- LOGIN ----------
      loginAction: async (credentials) => {
        try {
          const res = await loginUser(credentials);
          console.log('✅ loginUser response:', res);

          const profile = res.data.profile;
          const serverRole = normalizeRole(res.data.role);       // เช่น 'employee' | 'customer'
          const positionRole = pickPositionRole(profile);         // เช่น 'superadmin' | 'admin' | 'employee'

          // ยกระดับ role ถ้า BE ส่ง employee แต่งานจริงเป็น admin/superadmin จากตำแหน่ง
          const effectiveRole =
            serverRole === 'employee' && (positionRole === 'superadmin' || positionRole === 'admin')
              ? positionRole
              : serverRole;

          let branchFull = null;
          let employee = null;
          let customer = null;

          // ✅ ตั้งค่าก่อนเรียก API อื่น
          set({
            token: res.data.token,
            role: effectiveRole,
            isSuperAdmin: effectiveRole === 'superadmin',
          });

          // พนักงาน/แอดมิน/ซุปเปอร์แอดมิน
          if (['employee', 'admin', 'superadmin'].includes(effectiveRole)) {
            if (profile?.branch) {
              branchFull = await useBranchStore.getState().loadAndSetBranchById(profile.branch.id);
            }
            await useProductStore.getState().ensureDropdownsAction();

            const rawPosition = profile?.position?.name;
            const mappedPosition = rawPosition === 'employee' ? 'ผู้ดูแลระบบ' : rawPosition;

            employee = {
              id: profile?.id,
              name: profile?.name,
              phone: profile?.phone,
              email: profile?.email,
              positionName: mappedPosition || '__NO_POSITION__',
              branchId: profile?.branch?.id,
            };
          }

          // ลูกค้า
          if (effectiveRole === 'customer') {
            customer = {
              id: profile?.id,
              name: profile?.name,
              phone: profile?.phone,
              email: profile?.email,
            };
          }

          // ✅ ตั้งค่าเพิ่มเติมหลังโหลดข้อมูลเรียบร้อย
          set((state) => ({
            ...state,
            employee,
            customer,
          }));

          console.log('✅ loginAction success:', { profile, branchFull, effectiveRole });

          return {
            token: res.data.token,
            role: effectiveRole,
            profile,
          };
        } catch (err) {
          console.error('❌ loginAction error:', err);
          throw err;
        }
      },

      // ---------- Selectors ที่เรียกจากหน้า UI ----------
      isSuperAdminSelector: () => normalizeRole(useAuthStore.getState().role) === 'superadmin',
      isAdminOrAboveSelector: () => {
        const r = normalizeRole(useAuthStore.getState().role);
        return r === 'admin' || r === 'superadmin';
      },
      getRole: () => normalizeRole(useAuthStore.getState().role),
      canManageProductOrdering: () => {
        const r = normalizeRole(useAuthStore.getState().role);
        return r === 'admin' || r === 'superadmin';
      },
    }),
    { name: 'auth-storage' }
  )
);
