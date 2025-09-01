
// ✅ useEmployeeStore.js (แก้ key persist ไม่ให้ชนกับ auth-store)

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
    (set) => ({
      employee: null,
      branch: null,
      position: null,
      token: '',
      role: '',

      employees: [],
      employeeError: null,

      positions: [],
      fetchPositionsAction: async () => {
        try {
          const res = await getPositions();
          set({ positions: res });
        } catch (err) {
          console.error('โหลดตำแหน่งไม่สำเร็จ', err);
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
        set({ token: '', role: '', position: null, branch: null, employee: null });
      },

      setEmployee: (employee) => set({ employee }),

      getEmployees: async () => {
        try {
          const res = await getAllEmployees(); // ไม่ต้องส่ง token/branch แล้ว
          set({ employees: res });
        } catch (err) {
          set({ employeeError: err.message });
        }
      },

      addEmployee: async (form) => {
        try {
          const res = await createEmployee(form);
          set((state) => ({ employees: [...state.employees, res] }));
        } catch (err) {
          set({ employeeError: err.message });
        }
      },

      updateEmployee: async (id, form) => {
        try {
          const updated = await updateEmployee(id, form);
          set((state) => ({
            employees: state.employees.map((e) => (e.id === id ? updated : e)),
          }));
        } catch (err) {
          set({ employeeError: err.message });
        }
      },

      removeEmployee: async (id) => {
        try {
          await deleteEmployee(id);
          set((state) => ({ employees: state.employees.filter((e) => e.id !== id) }));
        } catch (err) {
          set({ employeeError: err.message });
        }
      },
    }),
    {
      name: 'employee-storage', // ✅ ไม่ชนกับ auth-storage
      partialize: (state) => ({
        employee: state.employee,
        branch: state.branch,
        position: state.position,
        // ไม่จำเป็นต้อง persist token/role ซ้ำ หาก authStore ดูแลอยู่แล้ว
      }),
    }
  )
);

export default useEmployeeStore;
