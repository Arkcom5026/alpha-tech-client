// ✅ src/features/employee/store/employeeStore.js
// ✅ Employee Store = HR / Employee Management only
// ✅ Auth / current login branch Source of Truth อยู่ที่ authStore.employee.branchId
// ✅ Branch detail / selected branch อยู่ที่ branchStore
// ✅ ไฟล์นี้ไม่ persist session/branch/token/role อีกต่อไป เพื่อลดข้อมูลซ้ำซ้อน

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import {
  createEmployee,
  deleteEmployee,
  getAllEmployees,
  updateEmployee as apiUpdateEmployee,
  getPositions,
  approveEmployee,
  findUserByEmail,
  updateUserRole as apiUpdateUserRole,
  getBranchDropdowns,
} from '../api/employeeApi';

const initialEmployeeSessionCompat = {
  // ⚠️ Deprecated compatibility fields:
  // ห้ามใช้เป็น Source of Truth สำหรับ session ปัจจุบัน
  // ถ้าต้องการ branchId ของผู้ login อยู่ ให้ใช้ authStore.employee.branchId
  employee: null,
  branch: null,
  position: null,
  token: '',
  role: '',
};

const useEmployeeStore = create(
  persist(
    (set) => ({
      ...initialEmployeeSessionCompat,

      employees: [],
      employeesLoading: false,
      employeesMeta: { page: 1, limit: 20, total: 0, pages: 1 },
      employeeError: null,

      positions: [],
      fetchPositionsAction: async () => {
        try {
          const res = await getPositions();
          set({ positions: Array.isArray(res) ? res : [] });
        } catch (err) {
          console.error('โหลดตำแหน่งไม่สำเร็จ', err);
        }
      },

      // ✅ รายการสาขาสำหรับตัวกรอง/ตั้งค่าพนักงาน
      // ใช้สำหรับงาน HR/Settings เท่านั้น ไม่ใช่ session branch
      branchOptions: [],
      fetchBranchOptionsAction: async () => {
        try {
          const rows = await getBranchDropdowns();
          set({ branchOptions: Array.isArray(rows) ? rows : [] });
        } catch (err) {
          console.error('โหลดสาขาไม่สำเร็จ', err);
        }
      },

      approveEmployeeAction: async (payload) => {
        try {
          await approveEmployee(payload);
        } catch (err) {
          console.error('❌ approveEmployeeAction error:', err);
          throw err;
        }
      },

      findUserByEmailAction: async (email) => {
        try {
          const user = await findUserByEmail(email);
          return user;
        } catch (err) {
          console.error('❌ findUserByEmailAction error:', err);
          throw err;
        }
      },

      // ⚠️ Deprecated compatibility only.
      // คงไว้กัน component เก่ายังเรียกอยู่ แต่ไม่ใช้เป็น SSoT แล้ว
      setSession: ({ position, employee } = {}) => {
        set({
          employee: employee || null,
          position: position || null,
          branch: null,
          token: '',
          role: '',
        });
      },

      clearSession: () => {
        set({ ...initialEmployeeSessionCompat });
      },

      setEmployee: (employee) => set({ employee }),

      // ✅ ดึงรายชื่อพนักงาน รองรับกรอง/ค้นหา/แบ่งหน้า/role
      // params: { page, limit, search, status, role, branchId }
      getEmployees: async (params = {}) => {
        try {
          set({ employeesLoading: true, employeeError: null });

          const data = await getAllEmployees(params);
          const items = Array.isArray(data) ? data : (data?.items || []);

          const normalized = items.map((e) => ({
            ...e,
            id: e.id ?? e.userId,
            name: e.name ?? e.user?.name ?? '',
            email: e.email ?? e.user?.email ?? '',
            role: (e.role ?? e.user?.role ?? '')?.toLowerCase?.() || '',
            status: (e.status ?? e.employeeStatus ?? '')?.toLowerCase?.() || '',
          }));

          const meta = Array.isArray(data)
            ? { page: 1, limit: normalized.length, total: normalized.length, pages: 1 }
            : {
                page: Number(data?.page || data?.meta?.page || params.page || 1),
                limit: Number(data?.limit || data?.meta?.limit || params.limit || 20),
                total: Number(data?.total || data?.meta?.total || normalized.length),
                pages: Number(data?.pages || data?.meta?.pages || 1),
              };

          set({
            employees: normalized,
            employeesMeta: meta,
            employeesLoading: false,
            employeeError: null,
          });

          return { items: normalized, meta };
        } catch (err) {
          set({
            employeesLoading: false,
            employeeError: err?.response?.data?.error || err?.message || 'โหลดข้อมูลล้มเหลว',
          });
          return null;
        }
      },

      addEmployee: async (form) => {
        try {
          const res = await createEmployee(form);
          set((state) => ({ employees: [...state.employees, res] }));
          return res;
        } catch (err) {
          set({ employeeError: err?.response?.data?.error || err?.message || 'สร้างพนักงานไม่สำเร็จ' });
          return null;
        }
      },

      updateEmployee: async (id, form) => {
        try {
          const updated = await apiUpdateEmployee(id, form);
          set((state) => ({
            employees: state.employees.map((e) => (e.id === id || e.userId === id ? { ...e, ...updated } : e)),
          }));
          return updated;
        } catch (err) {
          set({ employeeError: err?.response?.data?.error || err?.message || 'แก้ไขพนักงานไม่สำเร็จ' });
          return null;
        }
      },

      removeEmployee: async (id) => {
        try {
          await deleteEmployee(id);
          set((state) => ({ employees: state.employees.filter((e) => (e.id ?? e.userId) !== id) }));
          return true;
        } catch (err) {
          set({ employeeError: err?.response?.data?.error || err?.message || 'ลบพนักงานไม่สำเร็จ' });
          return false;
        }
      },

      // ✅ เปลี่ยน Role ของผู้ใช้ (อนุญาตเฉพาะ admin ↔ employee)
      updateUserRoleAction: async (userId, nextRole) => {
        const allowed = ['admin', 'employee'];
        const roleLower = String(nextRole || '').toLowerCase();

        if (!allowed.includes(roleLower)) {
          throw new Error('Allowed role: admin หรือ employee เท่านั้น');
        }

        try {
          await apiUpdateUserRole(Number(userId), roleLower);

          set((state) => ({
            employees: state.employees.map((e) => {
              const match = (e.id ?? e.userId) === Number(userId);
              if (!match) return e;

              const updated = { ...e, role: roleLower };
              if (updated.user) updated.user = { ...updated.user, role: roleLower };

              return updated;
            }),
          }));

          return true;
        } catch (err) {
          console.error('❌ updateUserRoleAction error:', err);
          throw err;
        }
      },
    }),
    {
      name: 'employee-storage',
      version: 2,

      // ✅ ตัด persisted session/branch/token/role เก่าทิ้งเมื่อ migrate
      migrate: () => ({}),

      // ✅ ไม่ persist session ปัจจุบันใน employeeStore อีก
      // HR data ไม่จำเป็นต้องค้างข้าม reload
      partialize: () => ({}),
    }
  )
);

export default useEmployeeStore;
