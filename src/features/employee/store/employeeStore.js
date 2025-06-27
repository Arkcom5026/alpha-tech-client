// ✅ useEmployeeStore.js (ใหม่ แบบ default export + persist storage)

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  createEmployee,
  deleteEmployee,
  getAllEmployees,
  updateEmployee,
  getPositions,
  approveEmployee,
  findUserByEmail,
} from '../api/employeeApi';

const useEmployeeStore = create(
  persist(
    (set, get) => ({
      // 🔐 สำหรับ session และ RBAC
      employee: null,
      branch: null,
      position: null,
      token: '',
      role: '',

      // 🔁 CRUD พนักงาน
      employees: [],
      employeeError: null,

      // ✅ ตำแหน่งพนักงาน
      positions: [],
      fetchPositionsAction: async () => {
        try {
          const res = await getPositions();
          set({ positions: res });
        } catch (err) {
          console.error('โหลดตำแหน่งไม่สำเร็จ', err);
        }
      },

      // ✅ อนุมัติพนักงานใหม่
      approveEmployeeAction: async (payload) => {
        try {
          await approveEmployee(payload);
        } catch (err) {
          console.error('❌ approveEmployeeAction error:', err);
          throw err;
        }
      },

      // ✅ ค้นหาผู้ใช้เพื่ออนุมัติ
      findUserByEmailAction: async (email) => {
        try {
          const user = await findUserByEmail(email);
          return user;
        } catch (err) {
          console.error('❌ findUserByEmailAction error:', err);
          throw err;
        }
      },

      // ✅ Session
      setSession: ({ token, role, position, branch, employee }) => {
        const fullBranch = branch
          ? {
              id: branch.id,
              name: branch.name,
              address: branch.address,
              phone: branch.phone,
              fax: branch.fax,
              email: branch.email,
              taxId: branch.taxId,
              vatRate: branch.vatRate || 7,
            }
          : null;
        set({ token, role, position, branch: fullBranch, employee });
      },

      clearSession: () => {
        set({
          token: '',
          role: '',
          position: null,
          branch: null,
          employee: null,
        });
        localStorage.removeItem('auth-storage');
        localStorage.removeItem('branch-storage');
      },

      // ✅ Setter สำหรับ employee โดยตรง (ใช้หลัง F5 reload)
      setEmployee: (employee) => set({ employee }),

      // ✅ CRUD พนักงาน (ดึง token/branchId จาก store โดยตรง)
      getEmployees: async () => {
        try {
          const { token, branch } = get();
          const res = await getAllEmployees(token, branch.id);
          set({ employees: res });
        } catch (err) {
          set({ employeeError: err.message });
        }
      },

      addEmployee: async (form) => {
        try {
          const { token } = get();
          const res = await createEmployee(token, form);
          set((state) => ({ employees: [...state.employees, res] }));
        } catch (err) {
          set({ employeeError: err.message });
        }
      },

      updateEmployee: async (id, form) => {
        try {
          const { token } = get();
          const updated = await updateEmployee(token, id, form);
          set((state) => ({
            employees: state.employees.map((e) => (e.id === id ? updated : e)),
          }));
        } catch (err) {
          set({ employeeError: err.message });
        }
      },

      removeEmployee: async (id) => {
        try {
          const { token } = get();
          await deleteEmployee(token, id);
          set((state) => ({
            employees: state.employees.filter((e) => e.id !== id),
          }));
        } catch (err) {
          set({ employeeError: err.message });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        employee: state.employee,
        branch: state.branch,
        position: state.position,
        token: state.token,
        role: state.role,
      }),
    }
  )
);

export default useEmployeeStore;
