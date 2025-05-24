// ✅ useEmployeeStore.js (ใหม่ แบบ default export + ฟังก์ชันครบ)
import { create } from 'zustand';
import {
  createEmployee,
  deleteEmployee,
  getAllEmployees,
  updateEmployee,
} from '../api/employeeApi';

const useEmployeeStore = create((set) => ({
  // 🔐 สำหรับ session และ RBAC
  employee: null,
  branch: null,
  position: null,
  token: '',
  role: '',

  // 🔁 CRUD พนักงาน
  employees: [],
  employeeError: null,

  // ✅ Session
  setSession: ({ token, role, position, branch, employee }) =>
    set({ token, role, position, branch, employee }),
  clearSession: () =>
    set({ token: '', role: '', position: '', branch: null, employee: null }),

  // ✅ CRUD พนักงาน
  getEmployees: async (token, branchId) => {
    try {
      const res = await getAllEmployees(token, branchId);
      set({ employees: res });
    } catch (err) {
      set({ employeeError: err.message });
    }
  },

  addEmployee: async (token, form) => {
    try {
      const res = await createEmployee(token, form);
      set((state) => ({ employees: [...state.employees, res] }));
    } catch (err) {
      set({ employeeError: err.message });
    }
  },

  updateEmployee: async (token, id, form) => {
    try {
      const updated = await updateEmployee(token, id, form);
      set((state) => ({
        employees: state.employees.map((e) => (e.id === id ? updated : e)),
      }));
    } catch (err) {
      set({ employeeError: err.message });
    }
  },

  removeEmployee: async (token, id) => {
    try {
      await deleteEmployee(token, id);
      set((state) => ({
        employees: state.employees.filter((e) => e.id !== id),
      }));
    } catch (err) {
      set({ employeeError: err.message });
    }
  },
}));

export default useEmployeeStore;
