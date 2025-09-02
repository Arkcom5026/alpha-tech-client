// --- filepath: src/features/position/stores/positionStore.js
import { create } from 'zustand';
import {
  getPositions,
  getPositionDropdowns,
  getPositionById,
  createPosition,
  updatePosition,
  toggleActivePosition,
} from '../api/positionApi.js';

export const usePositionStore = create((set) => ({
  list: [],
  meta: { page: 1, limit: 20, total: 0, pages: 0 },
  dropdowns: [],
  current: null,
  loading: false,
  error: null,
  message: null,
  roles: ['employee', 'admin'], // ใช้ในหน้า Positions สำหรับจัดการ role ของตำแหน่ง

  // Load list (มี normalize ให้มีคีย์ role เสมอ)
  fetchListAction: async (params = {}) => {
    try {
      set({ loading: true, error: null, message: null });
      const data = await getPositions(params);

      const items = Array.isArray(data) ? data : (data?.items || []);
      const normalized = items.map((it) => ({
        ...it,
        role: it?.role ?? it?.defaultRole ?? it?.systemRole ?? null,
      }));

      const meta = Array.isArray(data)
        ? { page: 1, limit: normalized.length, total: normalized.length, pages: 1 }
        : (data?.meta || { page: 1, limit: 20, total: normalized.length, pages: 1 });

      set({ list: normalized, meta, loading: false });
      return { items: normalized, meta };
    } catch (e) {
      set({ loading: false, error: e?.response?.data?.error || e?.message || 'โหลดข้อมูลล้มเหลว' });
      return null;
    }
  },

  // Dropdowns (active only by default)
  fetchDropdownsAction: async (active = true) => {
    try {
      const items = await getPositionDropdowns(active);
      set({ dropdowns: items || [] });
      return items;
    } catch (e) {
      set({ error: e?.response?.data?.error || e?.message || 'โหลด dropdown ล้มเหลว' });
      return [];
    }
  },

  // Get by id (normalize role)
  fetchByIdAction: async (id) => {
    try {
      set({ loading: true, error: null });
      const item = await getPositionById(id);
      const normalized = item ? { ...item, role: item?.role ?? item?.defaultRole ?? item?.systemRole ?? null } : null;
      set({ current: normalized, loading: false });
      return normalized;
    } catch (e) {
      set({ loading: false, error: e?.response?.data?.error || e?.message || 'ไม่พบข้อมูล' });
      return null;
    }
  },

  // Create
  createAction: async (payload) => {
    try {
      set({ loading: true, error: null, message: null });
      const created = await createPosition(payload);
      set({ loading: false, message: 'สร้างตำแหน่งเรียบร้อย' });
      return created;
    } catch (e) {
      set({ loading: false, error: e?.response?.data?.error || e?.message || 'สร้างไม่สำเร็จ' });
      return null;
    }
  },

  // Update (รองรับส่ง { role } มาด้วย)
  updateAction: async (id, payload) => {
    try {
      set({ loading: true, error: null, message: null });
      const updated = await updatePosition(id, payload);
      const normalized = updated ? { ...updated, role: updated?.role ?? updated?.defaultRole ?? updated?.systemRole ?? null } : null;

      // refresh current list quickly (immutable update)
      set((s) => ({
        list: s.list.map((it) => (it.id === id ? { ...it, ...normalized } : it)),
        loading: false,
        message: 'บันทึกการแก้ไขเรียบร้อย',
      }));
      return normalized;
    } catch (e) {
      set({ loading: false, error: e?.response?.data?.error || e?.message || 'แก้ไขไม่สำเร็จ' });
      return null;
    }
  },

  // อัปเดต Role ของตำแหน่ง (จำกัด admin/employee)
  updateRoleAction: async (id, role) => {
    try {
      const allowed = ['admin', 'employee'];
      if (!allowed.includes(String(role))) throw new Error('Allowed role: admin หรือ employee เท่านั้น');

      set({ loading: true, error: null, message: null });
      const updated = await updatePosition(id, { role });
      const normalized = updated ? { ...updated, role: updated?.role ?? updated?.defaultRole ?? updated?.systemRole ?? null } : null;

      set((s) => ({
        list: s.list.map((it) => (it.id === id ? { ...it, ...normalized } : it)),
        loading: false,
        message: 'อัปเดต Role สำเร็จ',
      }));
      return normalized;
    } catch (e) {
      set({ loading: false, error: e?.response?.data?.error || e?.message || 'อัปเดต Role ไม่สำเร็จ' });
      return null;
    }
  },

  // Toggle active
  toggleActiveAction: async (id) => {
    try {
      set({ loading: true, error: null, message: null });
      const updated = await toggleActivePosition(id);
      const normalized = updated ? { ...updated, role: updated?.role ?? updated?.defaultRole ?? updated?.systemRole ?? null } : null;

      set((s) => ({
        list: s.list.map((it) => (it.id === id ? { ...it, ...normalized } : it)),
        loading: false,
        message: 'อัปเดตสถานะสำเร็จ',
      }));
      return normalized;
    } catch (e) {
      set({ loading: false, error: e?.response?.data?.error || e?.message || 'อัปเดตสถานะไม่สำเร็จ' });
      return null;
    }
  },

  // Helper
  resetCurrentAction: () => set({ current: null, error: null, message: null }),
}));
