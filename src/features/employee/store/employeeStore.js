// ✅ employeeStore.js (แก้ key persist ไม่ให้ชนกับ auth-store)

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

const useEmployeeStore = create(
  persist(
    (set) => ({
      employee: null,
      branch: null,
      position: null,
      token: '',
      role: '',

      employees: [],
      employeesLoading: false,
      employeesMeta: { page: 1, limit: 20, total: 0, pages: 1 },
      employeeError: null,

      positions: [],
      fetchPositionsAction: async () => {
        try {
          const res = await getPositions();
          set({ positions: res });
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('โหลดตำแหน่งไม่สำเร็จ', err);
        }
      },

      // ✅ รายการสาขาสำหรับตัวกรอง (เฉพาะ superadmin จะเรียก endpoint นี้ได้)
      branchOptions: [],
      fetchBranchOptionsAction: async () => {
        try {
          const rows = await getBranchDropdowns();
          set({ branchOptions: Array.isArray(rows) ? rows : [] });
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('โหลดสาขาไม่สำเร็จ', err);
        }
      },

      approveEmployeeAction: async (payload) => {
        try {
          await approveEmployee(payload);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('❌ approveEmployeeAction error:', err);
          throw err;
        }
      },

      findUserByEmailAction: async (email) => {
        try {
          const user = await findUserByEmail(email);
          return user;
        } catch (err) {
          // eslint-disable-next-line no-console
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

          set({ employees: normalized, employeesMeta: meta, employeesLoading: false });
          return { items: normalized, meta };
        } catch (err) {
          set({ employeesLoading: false, employeeError: err?.response?.data?.error || err?.message || 'โหลดข้อมูลล้มเหลว' });
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
          // eslint-disable-next-line no-console
          console.error('❌ updateUserRoleAction error:', err);
          throw err;
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

