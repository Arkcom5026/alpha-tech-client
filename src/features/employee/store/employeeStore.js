// ✅ src/features/employee/store/employeeStore.js
// ✅ Employee Store = HR / Employee Management only
// ✅ Auth / current login branch Source of Truth อยู่ที่ authStore.employee.branchId
// ✅ Branch detail / selected branch อยู่ที่ branchStore
// ✅ Auth store remains session authority.
// ✅ ไฟล์นี้ไม่ persist session/branch/token/role อีกต่อไป เพื่อลดข้อมูลซ้ำซ้อน

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import {
  createEmployee,
  getAllEmployees,
  updateEmployee as apiUpdateEmployee,
  setEmployeeActive,
  getPositions,
  approveEmployee,
  findUserByEmail,
  updateUserRole as apiUpdateUserRole,
  getBranchDropdowns,
} from '../api/employeeApi';

const initialEmployeeSessionCompat = {
  employee: null,
  branch: null,
  position: null,
  token: '',
  role: '',
};

const normalizeEmployee = (employee = {}) => ({
  ...employee,
  id: employee.id ?? employee.userId,
  name: employee.name ?? employee.user?.name ?? '',
  email: employee.email ?? employee.user?.email ?? '',
  role: String(employee.role ?? employee.user?.role ?? '').toLowerCase(),
  status: String(employee.status ?? '').toLowerCase(),
});

const useEmployeeStore = create(
  persist(
    (set, get) => ({
      ...initialEmployeeSessionCompat,

      employees: [],
      employeesLoading: false,
      employeeMutating: false,
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
        if (get().employeeMutating) {
          throw new Error('กำลังบันทึกข้อมูลพนักงานอยู่ กรุณารอสักครู่');
        }
        set({ employeeMutating: true, employeeError: null });
        try {
          return await approveEmployee(payload);
        } catch (err) {
          console.error('❌ approveEmployeeAction error:', err);
          throw err;
        } finally {
          set({ employeeMutating: false });
        }
      },

      findUserByEmailAction: async (email) => {
        try {
          return await findUserByEmail(email);
        } catch (err) {
          console.error('❌ findUserByEmailAction error:', err);
          throw err;
        }
      },

      setSession: ({ position, employee } = {}) => {
        set({
          employee: employee || null,
          position: position || null,
          branch: null,
          token: '',
          role: '',
        });
      },

      clearSession: () => set({ ...initialEmployeeSessionCompat }),
      setEmployee: (employee) => set({ employee }),

      getEmployees: async (params = {}) => {
        try {
          set({ employeesLoading: true, employeeError: null });
          const data = await getAllEmployees(params);
          const items = Array.isArray(data) ? data : (data?.items || []);
          const normalized = items.map(normalizeEmployee);

          const meta = Array.isArray(data)
            ? { page: 1, limit: normalized.length, total: normalized.length, pages: 1 }
            : {
                page: Number(data?.page || params.page || 1),
                limit: Number(data?.limit || params.limit || 20),
                total: Number(data?.total || normalized.length),
                pages: Number(data?.pages || 1),
              };

          set({ employees: normalized, employeesMeta: meta, employeesLoading: false, employeeError: null });
          return { items: normalized, meta };
        } catch (err) {
          set({
            employeesLoading: false,
            employeeError: err?.response?.data?.message || err?.response?.data?.error || err?.message || 'โหลดข้อมูลล้มเหลว',
          });
          return null;
        }
      },

      addEmployee: async (form) => {
        if (get().employeeMutating) return null;
        set({ employeeMutating: true, employeeError: null });
        try {
          const res = normalizeEmployee(await createEmployee(form));
          set((state) => ({ employees: [...state.employees, res], employeeError: null }));
          return res;
        } catch (err) {
          set({ employeeError: err?.response?.data?.message || err?.message || 'สร้างพนักงานไม่สำเร็จ' });
          return null;
        } finally {
          set({ employeeMutating: false });
        }
      },

      updateEmployee: async (id, form) => {
        if (get().employeeMutating) return null;
        set({ employeeMutating: true, employeeError: null });
        try {
          const updated = normalizeEmployee(await apiUpdateEmployee(id, form));
          set((state) => ({
            employees: state.employees.map((employee) => (employee.id === Number(id) ? { ...employee, ...updated } : employee)),
            employeeError: null,
          }));
          return updated;
        } catch (err) {
          set({ employeeError: err?.response?.data?.message || err?.message || 'แก้ไขพนักงานไม่สำเร็จ' });
          return null;
        } finally {
          set({ employeeMutating: false });
        }
      },

      setEmployeeActiveAction: async (id, active) => {
        if (get().employeeMutating) {
          throw new Error('กำลังบันทึกข้อมูลพนักงานอยู่ กรุณารอสักครู่');
        }
        set({ employeeMutating: true, employeeError: null });
        try {
          const result = await setEmployeeActive(id, active);
          const updated = normalizeEmployee(result?.employee || {});
          set((state) => ({
            employees: state.employees.map((employee) =>
              employee.id === Number(id)
                ? { ...employee, ...updated, status: active ? 'active' : 'inactive', active: Boolean(active) }
                : employee
            ),
            employeeError: null,
          }));
          return result;
        } catch (err) {
          set({
            employeeError:
              err?.response?.data?.message || err?.message || (active ? 'เปิดใช้งานพนักงานไม่สำเร็จ' : 'ระงับพนักงานไม่สำเร็จ'),
          });
          throw err;
        } finally {
          set({ employeeMutating: false });
        }
      },

      // Never delete employee history. Use activation state instead.
      removeEmployee: async () => {
        set({ employeeError: 'ระบบไม่อนุญาตให้ลบประวัติพนักงาน กรุณาใช้การระงับการใช้งาน' });
        return false;
      },

      updateUserRoleAction: async (userId, nextRole) => {
        if (get().employeeMutating) {
          throw new Error('กำลังบันทึกข้อมูลพนักงานอยู่ กรุณารอสักครู่');
        }
        const roleLower = String(nextRole || '').toLowerCase();
        if (!['admin', 'employee'].includes(roleLower)) {
          throw new Error('Allowed role: admin หรือ employee เท่านั้น');
        }

        set({ employeeMutating: true, employeeError: null });
        try {
          await apiUpdateUserRole(Number(userId), roleLower);
          set((state) => ({
            employees: state.employees.map((employee) => {
              if (employee.userId !== Number(userId)) return employee;
              return {
                ...employee,
                role: roleLower,
                user: employee.user ? { ...employee.user, role: roleLower } : employee.user,
              };
            }),
            employeeError: null,
          }));
          return true;
        } finally {
          set({ employeeMutating: false });
        }
      },
    }),
    {
      name: 'employee-storage',
      version: 3,
      migrate: () => ({}),
      partialize: () => ({}),
    }
  )
);

export default useEmployeeStore;
