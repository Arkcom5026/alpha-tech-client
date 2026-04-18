





// src/features/auth/store/authStore.js

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { loginUser, verifySession, requestPasswordReset, resetPassword } from '../api/authApi';
import { buildRoleContext, can as canCap, P1_CAP } from '../rbac/rbacClient';
import { useBranchStore } from '@/features/branch/store/branchStore';

// ---------- helpers ----------
const normalizeRole = (r) => {
  const v = (r || '').toString().trim().toLowerCase();
  return v === 'supperadmin' ? 'superadmin' : v; // กันสะกดผิดจาก BE
};

// แยก "ชื่อแสดงผล" vs "คีย์ตำแหน่ง" (RBAC)
const normalizePositionKey = (rawName) => {
  const v = (rawName || '').toString().trim().toLowerCase();
  if (!v) return null;

  // EN
  if (v === 'superadmin') return 'superadmin';
  if (v === 'admin') return 'admin';
  if (v === 'owner') return 'owner';
  if (v === 'manager') return 'manager';
  if (v === 'staff') return 'staff';
  if (v === 'employee') return 'employee';
  if (v === 'sales') return 'sales';

  // TH (ตำแหน่งในระบบจริง)
  if (['ซุปเปอร์แอดมิน', 'ซุปเปอร์แอดมินระบบ', 'ผู้ดูแลระบบสูงสุด'].includes(v)) return 'superadmin';
  if (['เจ้าของ', 'เจ้าของกิจการ', 'owner'].includes(v)) return 'owner';
  if (['ผู้ดูแลระบบ', 'แอดมิน', 'ผู้จัดการระบบ'].includes(v)) return 'admin';
  if (['ผู้จัดการ', 'ผู้จัดการสาขา'].includes(v)) return 'manager';
  if (['พนักงาน', 'พนักงานทั่วไป', 'สตาฟ', 'staff'].includes(v)) return 'staff';
  if (['พนักงานขาย', 'แคชเชียร์', 'ขายหน้าร้าน'].includes(v)) return 'sales';

  // fallback: ส่งค่าเดิม (แต่จะไม่ยกระดับ role ถ้าไม่รู้จัก)
  return v;
};

const pickPositionName = (profile) => (profile?.position?.name || '').toString().trim() || null;
const pickPositionKey = (profile) => normalizePositionKey(pickPositionName(profile));

// ตัดสิน profileType ให้ "employee" มาก่อนเสมอ ถ้าพบสัญญาณว่าเป็นพนักงาน
const deriveEffectiveProfileType = (serverProfileType, profile, serverRole) => {
  const spt = (serverProfileType || '').toString().trim().toLowerCase();
  const sr = normalizeRole(serverRole);

  const looksLikeEmployee = !!(
    profile?.position ||
    profile?.positionId ||
    profile?.branch ||
    profile?.branchId ||
    profile?.employeeId
  );

  // ✅ P1: customer สามารถเป็น employee ได้ด้วย → ยึด employee ก่อน
  if (looksLikeEmployee) return 'employee';

  // fallback จาก role
  if (['employee', 'admin', 'superadmin'].includes(sr)) return 'employee';
  if (sr === 'customer') return 'customer';

  return spt || null;
};

const getEmptyAuthState = () => ({
  token: null,
  role: null,
  profileType: null,
  employee: null,
  customer: null,
  authError: null,
  authChecked: false,
  isSuperAdmin: false,
  isBootstrappingAuth: false,
  isRequestPasswordResetLoading: false,
  requestPasswordResetError: null,
  requestPasswordResetSuccessMessage: '',
  isResetPasswordLoading: false,
  resetPasswordError: null,
  resetPasswordSuccessMessage: '',
});

const clearLegacyAuthStorage = () => {
  try {
    localStorage.removeItem('auth-storage');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  } catch (error) {
    console.error('❌ clearLegacyAuthStorage failed:', error);
  }
};

export const useAuthStore = create(
  persist(
    (set) => ({
      ...getEmptyAuthState(),

      setUser: ({ token, role, profileType, employee, customer }) =>
        set({
          token,
          role,
          profileType,
          employee,
          customer,
          authError: null,
          isSuperAdmin: normalizeRole(role) === 'superadmin',
          authChecked: true,
        }),

      markAuthCheckedAction: () => set({ authChecked: true }),
      setBootstrappingAuthAction: (isBootstrappingAuth) => set({ isBootstrappingAuth }),

      clearRequestPasswordResetStateAction: () =>
        set({
          isRequestPasswordResetLoading: false,
          requestPasswordResetError: null,
          requestPasswordResetSuccessMessage: '',
        }),

      clearResetPasswordStateAction: () =>
        set({
          isResetPasswordLoading: false,
          resetPasswordError: null,
          resetPasswordSuccessMessage: '',
        }),

      requestPasswordResetAction: async ({ email }) => {
        const normalizedEmail = (email || '').toString().trim().toLowerCase();

        set({
          isRequestPasswordResetLoading: true,
          requestPasswordResetError: null,
          requestPasswordResetSuccessMessage: '',
        });

        try {
          if (!normalizedEmail) {
            throw new Error('กรุณากรอกอีเมล');
          }

          const res = await requestPasswordReset({ email: normalizedEmail });
          const successMessage =
            res?.data?.message ||
            'หากข้อมูลของคุณมีอยู่ในระบบ เราได้ส่งลิงก์สำหรับตั้งรหัสผ่านใหม่แล้ว';

          set({
            isRequestPasswordResetLoading: false,
            requestPasswordResetError: null,
            requestPasswordResetSuccessMessage: successMessage,
          });

          return res?.data;
        } catch (error) {
          const serverMsg = error?.response?.data?.message;
          const friendlyMessage = serverMsg || 'ไม่สามารถส่งลิงก์รีเซ็ตรหัสผ่านได้';

          set({
            isRequestPasswordResetLoading: false,
            requestPasswordResetError: friendlyMessage,
            requestPasswordResetSuccessMessage: '',
          });

          console.error('❌ requestPasswordResetAction error:', error);
          throw error;
        }
      },

      resetPasswordAction: async ({ token, password, confirmPassword }) => {
        const normalizedToken = (token || '').toString().trim();

        set({
          isResetPasswordLoading: true,
          resetPasswordError: null,
          resetPasswordSuccessMessage: '',
        });

        try {
          if (!normalizedToken) {
            throw new Error('ลิงก์นี้ไม่ถูกต้องหรือไม่ครบถ้วน กรุณาขอรีเซ็ตรหัสผ่านใหม่อีกครั้ง');
          }

          if (!password || !confirmPassword) {
            throw new Error('กรุณากรอกรหัสผ่านใหม่และยืนยันรหัสผ่าน');
          }

          if (password.length < 6) {
            throw new Error('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
          }

          if (password !== confirmPassword) {
            throw new Error('ยืนยันรหัสผ่านไม่ตรงกัน');
          }

          const res = await resetPassword({
            token: normalizedToken,
            password,
            confirmPassword,
          });

          const successMessage =
            res?.data?.message || 'ตั้งรหัสผ่านใหม่เรียบร้อยแล้ว กรุณาเข้าสู่ระบบอีกครั้ง';

          set({
            isResetPasswordLoading: false,
            resetPasswordError: null,
            resetPasswordSuccessMessage: successMessage,
          });

          return res?.data;
        } catch (error) {
          const serverMsg = error?.response?.data?.message;
          const fallbackMessage = error?.message || 'ไม่สามารถตั้งรหัสผ่านใหม่ได้';
          const friendlyMessage = serverMsg || fallbackMessage;

          set({
            isResetPasswordLoading: false,
            resetPasswordError: friendlyMessage,
            resetPasswordSuccessMessage: '',
          });

          console.error('❌ resetPasswordAction error:', error);
          throw error;
        }
      },

      verifySessionAction: async () => {
        const state = useAuthStore.getState();
        const token = state.token;

        if (!token) {
          set({ authChecked: false, isBootstrappingAuth: false });
          return false;
        }

        try {
          set({ isBootstrappingAuth: true, authError: null });

          const res = await verifySession();
          const profile = res?.data?.profile || null;
          const serverRole = normalizeRole(res?.data?.role || state.role);
          const serverProfileType = (res?.data?.profileType || state.profileType || '').toString();
          const positionName = pickPositionName(profile);
          const positionKey = pickPositionKey(profile);
          const effectiveProfileType = deriveEffectiveProfileType(serverProfileType, profile, serverRole);
          const baseRole = effectiveProfileType === 'employee' ? 'employee' : serverRole;
          const effectiveRole = (() => {
            if (serverRole === 'superadmin') return 'superadmin';
            if (serverRole === 'admin') return 'admin';
            if (baseRole !== 'employee') return baseRole;
            if (positionKey === 'superadmin') return 'superadmin';
            if (positionKey === 'admin') return 'admin';
            if (positionKey === 'owner' || positionKey === 'manager') return 'admin';
            return 'employee';
          })();

          const branchIdFromServer =
            res?.data?.branchId ??
            profile?.branchId ??
            profile?.branch?.id ??
            state.employee?.branchId ??
            null;

          if (['employee', 'admin'].includes(effectiveRole) && !branchIdFromServer) {
            throw new Error('บัญชีพนักงานต้องมีสาขา (branchId) ก่อนเข้า POS');
          }

          let employee = null;
          let customer = null;

          if (['employee', 'admin', 'superadmin'].includes(effectiveRole)) {
            employee = {
              id: profile?.id,
              name: profile?.name,
              phone: profile?.phone,
              email: profile?.email,
              positionName: positionName || '__NO_POSITION__',
              positionKey: positionKey || null,
              branchId: branchIdFromServer ? Number(branchIdFromServer) : null,
            };

            if (branchIdFromServer) {
              await useBranchStore.getState().loadAndSetBranchById(Number(branchIdFromServer));
            }
          }

          if (effectiveRole === 'customer') {
            customer = {
              id: profile?.id,
              name: profile?.name,
              phone: profile?.phone,
              email: profile?.email,
            };
          }

          set({
            token,
            role: effectiveRole,
            profileType: effectiveProfileType,
            employee,
            customer,
            authError: null,
            isSuperAdmin: effectiveRole === 'superadmin',
            authChecked: true,
            isBootstrappingAuth: false,
          });

          return true;
        } catch (error) {
          const status = error?.response?.status;
          const serverMsg = error?.response?.data?.message;
          const friendlyMessage =
            status === 401 || status === 403
              ? 'เซสชันหมดอายุหรือไม่มีสิทธิ์ใช้งาน กรุณาเข้าสู่ระบบใหม่'
              : serverMsg || error?.message || 'ตรวจสอบเซสชันไม่สำเร็จ';

          console.error('❌ verifySessionAction failed:', error);
          useAuthStore.getState().resetAuthStateAction();
          set({
            authError: friendlyMessage,
            isBootstrappingAuth: false,
            authChecked: false,
          });
          return false;
        }
      },

      bootstrapAuthAction: async () => {
        const state = useAuthStore.getState();

        if (!state.token) {
          set({ authChecked: false, isBootstrappingAuth: false });
          return false;
        }

        set({ isBootstrappingAuth: true });
        return state.verifySessionAction();
      },
      resetAuthStateAction: () => {
        set(getEmptyAuthState());
        clearLegacyAuthStorage();
      },

      logout: () => {
        useAuthStore.getState().resetAuthStateAction();
      },

      logoutAction: () => {
        useAuthStore.getState().resetAuthStateAction();
      },

      clearStorage: () => {
        useAuthStore.getState().resetAuthStateAction();
      },

      isLoggedIn: () => {
        const state = useAuthStore.getState();
        return !!state.token && !!state.authChecked && !state.isBootstrappingAuth;
      },

      // ---------- LOGIN ----------
      loginAction: async (credentials) => {
        try {
          // reset error each attempt (UI should render authError as inline block)
          set({ authError: null, authChecked: false, isBootstrappingAuth: false });
          const res = await loginUser(credentials);
          console.log('✅ loginUser response:', res);

          const profile = res.data.profile;
          const serverRole = normalizeRole(res.data.role); // 'employee' | 'customer' | ...
          const serverProfileType = (res.data.profileType || '').toString();
          const positionName = pickPositionName(profile);
          const positionKey = pickPositionKey(profile);

          // ✅ profileType: employee มาก่อนเสมอ
          const effectiveProfileType = deriveEffectiveProfileType(serverProfileType, profile, serverRole);

          // ✅ ยกระดับ role จาก "ตำแหน่ง" ได้ (รองรับชื่อไทย)
          // เงื่อนไขเดิม: serverRole เป็น employee แล้วตำแหน่งเป็น admin/superadmin → ยกระดับ
          // เพิ่มเติม: ถ้า serverRole มาผิดเป็น customer แต่ context เป็น employee → force เป็น employee ก่อน
          const baseRole = effectiveProfileType === 'employee' ? 'employee' : serverRole;
          // ✅ ยกระดับสิทธิ์จากตำแหน่ง (RBAC)
          // - admin/superadmin ใช้ตามคีย์ตำแหน่ง
          // - owner/manager ให้ถือเป็น admin (backoffice)
          const effectiveRole = (() => {
            // ✅ Trust explicit platform roles from BE (even if no EmployeeProfile)
            if (serverRole === 'superadmin') return 'superadmin';
            if (serverRole === 'admin') return 'admin';

            if (baseRole !== 'employee') return baseRole;

            if (positionKey === 'superadmin') return 'superadmin';
            if (positionKey === 'admin') return 'admin';
            if (positionKey === 'owner' || positionKey === 'manager') return 'admin';

            return 'employee';
          })();

          let branchFull = null;
          const branchIdFromServer =
            res.data?.branchId ??
            profile?.branchId ??
            profile?.branch?.id ??
            null;

          // ✅ BRANCH_SCOPE_ENFORCED (P1): Staff session must always have branchId
          if (['employee', 'admin'].includes(effectiveRole) && !branchIdFromServer) {
            const msg = 'บัญชีพนักงานต้องมีสาขา (branchId) ก่อนเข้า POS (กรุณาให้แอดมินกำหนดสาขาใน EmployeeProfile)';
            set({ authError: msg });
            useAuthStore.getState().resetAuthStateAction();
            throw new Error(msg);
          }

          let employee = null;
          let customer = null;

          // ✅ ตั้งค่าก่อนเรียกอะไรอื่น (atomic enough to satisfy guards)
          // NOTE: For staff roles, we set employee.branchId immediately to avoid "token exists but branch missing" window.
          set({
            token: res.data.token,
            role: effectiveRole,
            profileType: effectiveProfileType,
            authError: null,
            isSuperAdmin: effectiveRole === 'superadmin',
            authChecked: true,
            employee: ['employee', 'admin', 'superadmin'].includes(effectiveRole)
              ? {
                  id: profile?.id,
                  name: profile?.name,
                  phone: profile?.phone,
                  email: profile?.email,
                  positionName: positionName || '__NO_POSITION__',
                  positionKey: positionKey || null,
                  branchId: branchIdFromServer ? Number(branchIdFromServer) : null,
                }
              : null,
            customer: effectiveRole === 'customer'
              ? {
                  id: profile?.id,
                  name: profile?.name,
                  phone: profile?.phone,
                  email: profile?.email,
                }
              : null,
          });

          // พนักงาน/แอดมิน/ซุปเปอร์แอดมิน
          if (['employee', 'admin', 'superadmin'].includes(effectiveRole)) {
            // ✅ Branch context is mandatory for POS. Prefer explicit id from server/token.
            if (branchIdFromServer) {
              branchFull = await useBranchStore.getState().loadAndSetBranchById(Number(branchIdFromServer));
            } else if (profile?.branch?.id) {
              branchFull = await useBranchStore.getState().loadAndSetBranchById(Number(profile.branch.id));
            }

            employee = {
              id: profile?.id,
              name: profile?.name,
              phone: profile?.phone,
              email: profile?.email,
              // ✅ แยกชัดเจน: ชื่อใช้แสดงผล vs key ใช้ทำ RBAC
              positionName: positionName || '__NO_POSITION__',
              positionKey: positionKey || null,
              branchId: branchIdFromServer ?? profile?.branch?.id ?? null,
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

          set((state) => ({
            ...state,
            authChecked: true,
            employee: employee ?? state.employee,
            customer: customer ?? state.customer,
          }));

          console.log('✅ loginAction success:', { profile, branchFull, effectiveRole, effectiveProfileType, positionKey });

          return {
            token: res.data.token,
            role: effectiveRole,
            profileType: effectiveProfileType,
            profile,
          };
        } catch (err) {
          const code = err?.response?.data?.code;
          const serverMsg = err?.response?.data?.message;

          const friendly = (() => {
            if (code === 'EMPLOYEE_PROFILE_REQUIRED') {
              return serverMsg || 'บัญชีนี้เป็นพนักงาน แต่ยังไม่มีโปรไฟล์พนักงาน/สาขา';
            }
            if (code === 'INVALID_CREDENTIALS') return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
            return serverMsg || err?.message || 'เข้าสู่ระบบไม่สำเร็จ';
          })();

          set({ authError: friendly, authChecked: false, isBootstrappingAuth: false });
          console.error('❌ loginAction error:', err);
          // keep throwing so UI can stop navigation; UI should read authError to show inline error.
          throw err;
        }
      },

      // ---------- Selectors ที่เรียกจากหน้า UI ----------
      isAuthenticatedSelector: () => {
        const state = useAuthStore.getState();
        return !!state.token && !!state.authChecked;
      },
      isSuperAdminSelector: () => normalizeRole(useAuthStore.getState().role) === 'superadmin',
      isAdminOrAboveSelector: () => {
        const state = useAuthStore.getState();
        const r = normalizeRole(state.role);

        // ✅ legacy role-based (ยังรองรับไว้)
        if (r === 'admin' || r === 'superadmin') return true;

        // ✅ position-based (ผู้จัดการ/เจ้าของ ถือเป็น backoffice)
        const pk = normalizeRole(state.employee?.positionKey);
        if (['owner', 'manager', 'admin', 'superadmin'].includes(pk)) return true;

        // ✅ capability-based (single source of truth เมื่อเปิด RBAC)
        try {
          return (
            state.canManageEmployeesSelector?.() ||
            state.canManageProductsSelector?.() ||
            state.canEditPricingSelector?.() ||
            state.canViewReportsSelector?.()
          );
        } catch {
          return false;
        }
      },

      getRole: () => normalizeRole(useAuthStore.getState().role),
      canManageProductOrdering: () => {
        const state = useAuthStore.getState();
        const r = normalizeRole(state.role);

        // ✅ legacy role-based (ยังรองรับไว้)
        if (r === 'admin' || r === 'superadmin') return true;

        // ✅ position-based (manager/admin/superadmin/owner)
        const pk = normalizeRole(state.employee?.positionKey);
        if (['owner', 'manager', 'admin', 'superadmin'].includes(pk)) return true;

        // ✅ capability-based
        try {
          return state.canManageProductsSelector?.() || state.canEditPricingSelector?.();
        } catch {
          return false;
        }
      },


      // ---------- RBAC (P1 Bestline) ----------
      /**
       * RoleContext (single source for FE guarding)
       * - derive from existing auth-store + branch-store values
       * - no API calls
       */
      getRoleContextSelector: () => {
        const state = useAuthStore.getState();
        const branchState = useBranchStore.getState?.() || {};

        const branch = branchState.branch || branchState.currentBranch || branchState.activeBranch || null;
        const rbacEnabled = branch?.RBACEnabled;

        return buildRoleContext({
          role: state.role, // rbacClient normalizes
          branchId: state.employee?.branchId ?? null,
          // ✅ ใช้ key เพื่อให้ RBAC ตรง (อย่าส่งชื่อไทยเข้าไปเป็นคีย์)
          positionName: state.employee?.positionKey ?? state.employee?.positionName ?? null,
          rbacEnabled: rbacEnabled ?? true,
        });
      },

      /**
       * Capability checker
       * @param {string} capKey - use P1_CAP.*
       */
      canSelector: (capKey) => {
        const ctx = useAuthStore.getState().getRoleContextSelector();
        return canCap(ctx, capKey);
      },

      // Convenience shortcuts (optional)
      capsSelector: () => useAuthStore.getState().getRoleContextSelector().capabilities,
      canManageEmployeesSelector: () => useAuthStore.getState().canSelector(P1_CAP.MANAGE_EMPLOYEES),
      canManageProductsSelector: () => useAuthStore.getState().canSelector(P1_CAP.MANAGE_PRODUCTS),
      canEditPricingSelector: () => useAuthStore.getState().canSelector(P1_CAP.EDIT_PRICING),
      canPurchasingSelector: () => useAuthStore.getState().canSelector(P1_CAP.PURCHASING),
      canReceiveStockSelector: () => useAuthStore.getState().canSelector(P1_CAP.RECEIVE_STOCK),
      canPosSaleSelector: () => useAuthStore.getState().canSelector(P1_CAP.POS_SALE),
      canStockAuditSelector: () => useAuthStore.getState().canSelector(P1_CAP.STOCK_AUDIT),
      canViewReportsSelector: () => useAuthStore.getState().canSelector(P1_CAP.VIEW_REPORTS),
    }),
    { name: 'auth-storage' }
  )
);





