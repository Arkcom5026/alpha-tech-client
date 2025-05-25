// ✅ employeeStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { loginEmployee } from '@/features/auth/api/authEmployee';
import apiClient from 'apiClient';

const useEmployeeStore = create(
  persist(
    (set, get) => ({
      token: null,
      employee: null,
      role: null,
      branch: null,
      branchName: null,
      position: null,
      isLoggedIn: false,
      isEmployeeLoaded: false,

      // ✅ Login
      actionLoginEmployee: async (form) => {
        try {
          const res = await loginEmployee(form);
          const { token, employee, branch } = res.data;
                  

          if (!employee || !branch) {
            console.error('❌ Login response ผิดรูปแบบ:', res.data);
            throw new Error('ข้อมูล login ไม่ถูกต้อง');
          }

          set({
            token,
            employee,
            role: employee.role || null,
            branch: branch,
            branchName: branch.name,
            position: employee.position || null,
            isLoggedIn: true,
            isEmployeeLoaded: true,
          });
         
          return res;
        } catch (err) {
          console.error('❌ Login Error:', err.response?.data || err.message);
          throw err;
        }
      },

      // ✅ ตรวจสอบ token → โหลด employee ปัจจุบัน
      actionFetchCurrentEmployee: async () => {
        const token = get().token;
        if (!token) return;

        try {
          const res = await apiClient.get('/api/current-employee', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          });

          const { employee, branch } = res.data;

          if (!employee || !branch) {
            throw new Error('ไม่พบข้อมูลพนักงาน');
          }

          set({
            employee,
            role: employee.role || null,
            branch: branch.id,
            branchName: branch.name,
            position: employee.position || null,
            isLoggedIn: true,
            isEmployeeLoaded: true,
          });
        } catch (err) {
          console.error('❌ Fetch Current Employee Error:', err.response?.data || err.message);
          get().logoutEmployee();
        }
      },

      // ✅ Logout
      logoutEmployee: () => {
        set({
          token: null,
          employee: null,
          role: null,
          branch: null,
          branchName: null,
          position: null,
          isLoggedIn: false,
          isEmployeeLoaded: false,
        });
      },
    }),
    {
      name: 'employee-storage',
      partialize: (state) => ({
        token: state.token,
        employee: state.employee,
        role: state.role,
        branch: state.branch,
        branchName: state.branchName,
        position: state.position,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);

export default useEmployeeStore;
