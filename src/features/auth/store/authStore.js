// src/features/auth/store/authStore.js

import { create } from 'zustand';
import { persist } from 'zustand/middleware'; 
import {
  loginUser,
  registerUser, 
  requestPasswordReset,
  resetPassword,
  logoutSession,
  logoutAllSessions,
} from '../api/authApi';

// 🟢 LINK CORE INSTANCE: นำเข้าตัวแกนหลักเพื่อควบคุมพอร์ต 5000[cite: 25]
import apiClient from '@/utils/apiClient';

import { buildRoleContext, can as canCap, P1_CAP } from '../rbac/rbacClient';
import { useBranchStore } from '@/features/branch/store/branchStore';

const normalizeRole = (r) => {
  const v = (r || '').toString().trim().toLowerCase();
  return v === 'supperadmin' ? 'superadmin' : v;
};

const normalizePositionKey = (rawName) => {
  const v = (rawName || '').toString().trim().toLowerCase();
  if (!v) return null;

  if (v === 'superadmin') return 'superadmin';
  if (v === 'admin') return 'admin';
  if (v === 'owner') return 'owner';
  if (v === 'manager') return 'manager';
  if (v === 'staff') return 'staff';
  if (v === 'employee') return 'employee';
  if (v === 'sales') return 'sales';

  if (['ซุปเปอร์แอดมิน', 'ซุปเปอร์แอดมินระบบ', 'ผู้ดูแลระบบสูงสุด'].includes(v)) return 'superadmin';
  if (['เจ้าของ', 'เจ้าของกิจการ', 'owner'].includes(v)) return 'owner';
  if (['ผู้ดูแลระบบ', 'แอดมิน', 'ผู้จัดการระบบ'].includes(v)) return 'admin';
  if (['ผู้จัดการ', 'ผู้จัดการสาขา'].includes(v)) return 'manager';
  if (['พนักงาน', 'พนักงานทั่วไป', 'สตาฟ', 'staff'].includes(v)) return 'staff';
  if (['พนักงานขาย', 'แคชเชียร์', 'ขายหน้านวัตกรรม'].includes(v)) return 'sales';

  return v;
};

const pickPositionName = (profile) => (profile?.position?.name || '').toString().trim() || null;
const pickPositionKey = (profile) => normalizePositionKey(pickPositionName(profile));

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

  if (looksLikeEmployee) return 'employee';
  if (['employee', 'admin', 'superadmin'].includes(sr)) return 'employee';
  if (sr === 'customer') return 'customer';

  return spt || null;
};

const getEmptyAuthState = () => ({
  token: null,
  accessToken: null,
  rememberMe: false,
  session: null,
  lastLoginIdentifier: '',
  role: null,
  profileType: null,
  employee: null,
  customer: null,
  authError: null,
  authChecked: false,
  isSuperAdmin: false,
  isBootstrappingAuth: false,
  isRegisterLoading: false,
  registerError: null,
  isSubEmployeeLoading: false,
  subEmployeeError: null,
  isRequestPasswordResetLoading: false,
  requestPasswordResetError: null,
  requestPasswordResetSuccessMessage: '',
  isResetPasswordLoading: false,
  resetPasswordError: null,
  resetPasswordSuccessMessage: '',
});

const clearLegacyAuthStorage = () => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  } catch (_error) {
    console.error('❌ clearLegacyAuthStorage failed:', _error);
  }
};
const loadBranchInBackground = (branchId, reason = 'auth') => {
  if (!branchId) return;

  Promise.resolve()
    .then(() => useBranchStore.getState().loadAndSetBranchById(Number(branchId)))
    .catch((error) => {
      console.warn(`⚠️ loadAndSetBranchById background failed (${reason}):`, error);
    });
};

let verifySessionPromise = null;
let bootstrapAuthPromise = null;

export const useAuthStore = create(
  persist(
    (set, get) => ({ // 🟢 เพิ่ม get เข้ามาควบคุมสเตตัสข้ามเลเยอร์
      ...getEmptyAuthState(),

      setUser: ({ token, accessToken, role, profileType, employee, customer, rememberMe = false, session = null }) =>
        set({
          token: accessToken || token || null,
          accessToken: accessToken || token || null,
          rememberMe,
          session,
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

      // 🟢 เปิดท่อรับค่า categoryId พ่วงเพิ่มเข้ามาจากหน้าฟอร์มลงทะเบียน
      registerPartnerAction: async ({ shopName, shopSlug, email, categoryId }) => {
        set({ isRegisterLoading: true, registerError: null });
        try {
          // 🟢 ยิงส่ง Payload ชุดสมบูรณ์รวมถึงไอดีหมวดธุรกิจข้ามฝั่งไปหา API หลังบ้าน
          const res = await registerUser({
            shopName: shopName.trim(),
            shopSlug: shopSlug.trim(),
            email: email.trim().toLowerCase(),
            categoryId: categoryId ? Number(categoryId) : 1 // Fallback เผื่อไว้กรณีไม่มีค่าส่งมา
          });
          
          set({ isRegisterLoading: false, registerError: null });
          return res?.data;
        } catch (error) {
          const serverMsg = error?.response?.data?.message;
          const friendlyMessage = serverMsg || 'ไม่สามารถลงทะเบียนร้านค้าได้ กรุณาลองใหม่อีกครั้ง';
          
          set({ isRegisterLoading: false, registerError: friendlyMessage });
          console.error('❌ registerPartnerAction error:', error);
          throw error;
        }
      },

      addSubEmployeeAction: async ({ name, email, password, phone, v2Role }) => {
        set({ isSubEmployeeLoading: true, subEmployeeError: null });
        try {
          const res = await apiClient.post('/auth/add-sub-employee', {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
            phone: phone.trim(),
            v2Role
          });

          set({ isSubEmployeeLoading: false, subEmployeeError: null });
          return res?.data;
        } catch (error) {
          const serverMsg = error?.response?.data?.message;
          const friendlyMessage = serverMsg || 'ไม่สามารถเปิดสิทธิ์เพิ่มพนักงานย่อยได้ กรุณาลองใหม่อีกครั้ง';
          
          set({ isSubEmployeeLoading: false, subEmployeeError: friendlyMessage });
          console.error('❌ addSubEmployeeAction error:', error);
          throw error;
        }
      },

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
            throw new Error('ลิงก์นี้ไม่ถูกต้องหรือหมดอายุแล้ว กรุณาขอรีเซ็ตรหัสผ่านใหม่อีกครั้ง');
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
        if (verifySessionPromise) return verifySessionPromise;

        verifySessionPromise = (async () => {
        const state = get(); // ใช้ค่าขอบเขตปัจจุบัน
        const token = state.accessToken || state.token;

        if (!token) {
          set({ authChecked: false, isBootstrappingAuth: false });
          return false;
        }

        try {
          set({ isBootstrappingAuth: true, authError: null });

          const res = await apiClient.get('/auth/me'); // 🟢 บังคับคุยผ่านตัวอินสแตนซ์ศูนย์กลางล็อกพอร์ต[cite: 25]

          // อ่าน state ล่าสุดหลัง request สำเร็จ เพราะ apiClient อาจทำ Silent Refresh
          // และอัปเดต access token ระหว่างที่ /auth/me กำลัง retry อยู่
          const latestState = get();

          const profile = res?.data?.profile || null;
          const serverRole = normalizeRole(res?.data?.role || latestState.role);
          const serverProfileType = (res?.data?.profileType || latestState.profileType || '').toString();
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
            latestState.employee?.branchId ??
            null;

          const branchSlugFromServer =
            res?.data?.branch?.slug ??
            profile?.branch?.slug ??
            latestState.employee?.branchSlug ??
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
              branchSlug: branchSlugFromServer || null,
            };

          }

          if (effectiveRole === 'customer') {
            customer = {
              id: profile?.id,
              name: profile?.name,
              phone: profile?.phone,
              email: profile?.email,
            };
          }

          // verifySessionAction มีหน้าที่ยืนยัน profile/สิทธิ์เท่านั้น
          // ห้ามเขียน token ที่อ่านไว้ก่อน request กลับทับ token ใหม่จาก Silent Refresh
          set({
            role: effectiveRole,
            profileType: effectiveProfileType,
            employee,
            customer,
            authError: null,
            isSuperAdmin: effectiveRole === 'superadmin',
            authChecked: true,
            isBootstrappingAuth: false,
          });

          if (branchIdFromServer && ['employee', 'admin', 'superadmin'].includes(effectiveRole)) {
            loadBranchInBackground(Number(branchIdFromServer), 'verify-session');
          }

          return true;
        } catch (error) {
          const status = error?.response?.status;
          const serverMsg = error?.response?.data?.message;
          const friendlyMessage =
            status === 401 || status === 403
              ? 'เซสชันหมดอายุหรือไม่มีสิทธิ์ใช้งาน กรุณาเข้าสู่ระบบใหม่'
              : serverMsg || error?.message || 'ตรวจสอบเซสชันไม่สำเร็จ';

          console.error('❌ verifySessionAction failed:', error);
          
          // 🟢 REMOVE FORCE RESET: ตัดการสั่งล้างอัตโนมัติออกชั่วคราว เพื่อเปิดเลนทางเดินให้ Silent Refresh ฝั่ง apiClient ทำงานชุบชีวิตได้[cite: 24, 25]
          if (status !== 401) {
            get().resetAuthStateAction();
          }

          set({
            authError: friendlyMessage,
            isBootstrappingAuth: false,
            authChecked: false,
          });
          return false;
        }
        })().finally(() => {
          verifySessionPromise = null;
        });

        return verifySessionPromise;
      },

      bootstrapAuthAction: async () => {
        if (bootstrapAuthPromise) return bootstrapAuthPromise;

        bootstrapAuthPromise = (async () => {
        const state = get();
      
        set({ isBootstrappingAuth: true, authError: null });
      
        if (state.accessToken || state.token) {
          return state.verifySessionAction();
        }
      
        try {
          const res = await apiClient.post('/auth/refresh');
          const accessToken = res?.data?.accessToken || res?.data?.token || null;
      
          if (!accessToken) {
            set({
              token: null,
              accessToken: null,
              authChecked: true,
              isBootstrappingAuth: false,
              authError: null,
            });
            return false;
          }
      
          set({
            token: accessToken,
            accessToken,
            rememberMe: !!res?.data?.session?.rememberMe,
            session: res?.data?.session || null,
            authError: null,
          });
      
          return await get().verifySessionAction();
        } catch (error) {
          const status = error?.response?.status;
      
          if (status === 401 || status === 403) {
            set({
              token: null,
              accessToken: null,
              authChecked: true,
              isBootstrappingAuth: false,
              authError: null,
            });
            return false;
          }
      
          console.error('❌ bootstrapAuthAction failed:', error);
      
          set({
            token: null,
            accessToken: null,
            authChecked: true,
            isBootstrappingAuth: false,
            authError: error?.response?.data?.message || error?.message || 'ตรวจสอบสถานะเข้าสู่ระบบไม่สำเร็จ',
          });
      
          return false;
        }
        })().finally(() => {
          bootstrapAuthPromise = null;
        });

        return bootstrapAuthPromise;
      },

      resetAuthStateAction: () => {
        const state = get();
        const preservedRememberMe = !!state.rememberMe;
        const preservedIdentifier = preservedRememberMe ? (state.lastLoginIdentifier || '') : '';

        set({
          ...getEmptyAuthState(),
          rememberMe: preservedRememberMe,
          lastLoginIdentifier: preservedIdentifier,
        });
        clearLegacyAuthStorage();
      },

      logout: async () => {
        try {
          await logoutSession();
        } catch (error) {
          console.error('❌ logout failed:', error);
        } finally { 
          get().resetAuthStateAction();
        }
      },

      logoutAction: async () => {
        try {
          await logoutSession();
        } catch (error) {
          console.error('❌ logoutAction failed:', error);
        } finally { 
          get().resetAuthStateAction();
          window.location.href = '/login';
        }
      },

      logoutAllDevicesAction: async () => {
        try {
          await logoutAllSessions();
        } catch (error) {
          console.error('❌ logoutAllDevicesAction failed:', error);
        } finally { 
          get().resetAuthStateAction();
        }
      },

      clearStorage: () => {
        get().resetAuthStateAction();
      },

      isLoggedIn: () => {
        const state = get();
        return !!(state.accessToken || state.token) && !!state.authChecked && !state.isBootstrappingAuth;
      },

      loginAction: async (credentials) => {
        try {
          set({ authError: null, authChecked: false, isBootstrappingAuth: false });
          const rememberMe = !!credentials?.rememberMe;
          const res = await loginUser(credentials);
          console.log('✅ loginUser response:', res);

          const profile = res.data.profile;
          const serverRole = normalizeRole(res.data.role);
          const serverProfileType = (res.data.profileType || '').toString();
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
            res.data?.branchId ??
            profile?.branchId ??
            profile?.branch?.id ??
            null;

          const branchSlugFromServer =
            res.data?.branch?.slug ??
            profile?.branch?.slug ??
            null;

          if (['employee', 'admin'].includes(effectiveRole) && !branchIdFromServer) {
            const msg = 'บัญชีพนักงานต้องมีสาขา (branchId) ก่อนเข้า POS (กรุณาให้แอดมินกำหนดสาขาใน EmployeeProfile)';
            set({ authError: msg });
            get().resetAuthStateAction();
            throw new Error(msg);
          }

          const targetBranchId = branchIdFromServer || profile?.branch?.id || null;

          const employeeData = ['employee', 'admin', 'superadmin'].includes(effectiveRole)
            ? {
                id: profile?.id,
                name: profile?.name,
                phone: profile?.phone,
                email: profile?.email,
                positionName: positionName || '__NO_POSITION__',
                positionKey: positionKey || null,
                branchId: targetBranchId ? Number(targetBranchId) : null,
                branchSlug: branchSlugFromServer || profile?.branch?.slug || null,
              }
            : null;

          const customerData = effectiveRole === 'customer'
            ? {
                id: profile?.id,
                name: profile?.name,
                phone: profile?.phone,
                email: profile?.email,
              }
            : null;

          set({
            token: res.data.accessToken || res.data.token || null,
            accessToken: res.data.accessToken || res.data.token || null,
            rememberMe,
            session: res.data.session || null,
            lastLoginIdentifier: rememberMe ? (credentials?.identifier || credentials?.emailOrPhone || '') : '',
            role: effectiveRole,
            profileType: effectiveProfileType,
            authError: null,
            isSuperAdmin: effectiveRole === 'superadmin',
            authChecked: true,
            employee: employeeData,
            customer: customerData,
          });

          if (targetBranchId && ['employee', 'admin', 'superadmin'].includes(effectiveRole)) {
            await useBranchStore.getState().loadAndSetBranchById(Number(targetBranchId));
          }

          console.log('✅ loginAction success:', { profile, effectiveRole, effectiveProfileType, positionKey });

          return {
            token: res.data.accessToken || res.data.token || null,
            accessToken: res.data.accessToken || res.data.token || null,
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
          throw err;
        }
      },

      isAuthenticatedSelector: () => {
        const state = get();
        return !!(state.accessToken || state.token) && !!state.authChecked && !state.isBootstrappingAuth;
      },
      isOnlineCustomerAuthenticatedSelector: () => {
        const state = get();
        return !!(state.accessToken || state.token) && !!state.authChecked && !state.isBootstrappingAuth && normalizeRole(state.role) === 'customer' && !!state.customer?.id;
      },
      isSuperAdminSelector: () => normalizeRole(get().role) === 'superadmin',
      isAdminOrAboveSelector: () => {
        const state = get();
        const r = normalizeRole(state.role);

        if (r === 'admin' || r === 'superadmin') return true;

        const pk = normalizeRole(state.employee?.positionKey);
        if (['owner', 'manager', 'admin', 'superadmin'].includes(pk)) return true;

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

      getRole: () => normalizeRole(get().role),
      canManageProductOrdering: () => {
        const state = get();
        const r = normalizeRole(state.role);

        if (r === 'admin' || r === 'superadmin') return true;

        const pk = normalizeRole(state.employee?.positionKey);
        if (['owner', 'manager', 'admin', 'superadmin'].includes(pk)) return true;

        try {
          return state.canManageProductsSelector?.() || state.canEditPricingSelector?.();
        } catch {
          return false;
        }
      },

      getRoleContextSelector: () => {
        const state = get();
        const branchState = useBranchStore.getState?.() || {};

        const branch = branchState.branch || branchState.currentBranch || branchState.activeBranch || null;
        const rbacEnabled = branch?.RBACEnabled;

        return buildRoleContext({
          role: state.role,
          branchId: state.employee?.branchId ?? null,
          positionName: state.employee?.positionKey ?? state.employee?.positionName ?? null,
          rbacEnabled: rbacEnabled ?? true,
        });
      },

      canSelector: (capKey) => {
        const ctx = get().getRoleContextSelector();
        return canCap(ctx, capKey);
      },

      capsSelector: () => get().getRoleContextSelector().capabilities,
      canManageEmployeesSelector: () => get().canSelector(P1_CAP.MANAGE_EMPLOYEES),
      canManageProductsSelector: () => get().canSelector(P1_CAP.MANAGE_PRODUCTS),
      canEditPricingSelector: () => get().canSelector(P1_CAP.EDIT_PRICING),
      canPurchasingSelector: () => get().canSelector(P1_CAP.PURCHASING),
      canReceiveStockSelector: () => get().canSelector(P1_CAP.RECEIVE_STOCK),
      canPosSaleSelector: () => get().canSelector(P1_CAP.POS_SALE),
      canStockAuditSelector: () => get().canSelector(P1_CAP.STOCK_AUDIT),
      canViewReportsSelector: () => get().canSelector(P1_CAP.VIEW_REPORTS),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        rememberMe: state.rememberMe,
        lastLoginIdentifier: state.lastLoginIdentifier,
      }),
    }
  )
);