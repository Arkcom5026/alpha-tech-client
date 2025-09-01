
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

export const usePositionStore = create((set, get) => ({
  list: [],
  meta: { page: 1, limit: 20, total: 0, pages: 0 },
  dropdowns: [],
  current: null,
  loading: false,
  error: null,
  message: null,

  // Load list
  fetchListAction: async (params = {}) => {
    try {
      set({ loading: true, error: null, message: null });
      const data = await getPositions(params);
      set({ list: data.items || [], meta: data.meta || {}, loading: false });
      return data;
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

  // Get by id
  fetchByIdAction: async (id) => {
    try {
      set({ loading: true, error: null });
      const item = await getPositionById(id);
      set({ current: item, loading: false });
      return item;
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

  // Update
  updateAction: async (id, payload) => {
    try {
      set({ loading: true, error: null, message: null });
      const updated = await updatePosition(id, payload);
      set({ loading: false, message: 'บันทึกการแก้ไขเรียบร้อย' });
      return updated;
    } catch (e) {
      set({ loading: false, error: e?.response?.data?.error || e?.message || 'แก้ไขไม่สำเร็จ' });
      return null;
    }
  },

  // Toggle active
  toggleActiveAction: async (id) => {
    try {
      set({ loading: true, error: null, message: null });
      const updated = await toggleActivePosition(id);
      // refresh current list quickly (naive):
      const { list } = get();
      set({
        list: list.map((it) => (it.id === updated.id ? updated : it)),
        loading: false,
        message: 'อัปเดตสถานะสำเร็จ',
      });
      return updated;
    } catch (e) {
      set({ loading: false, error: e?.response?.data?.error || e?.message || 'อัปเดตสถานะไม่สำเร็จ' });
      return null;
    }
  },

  // Helper
  resetCurrentAction: () => set({ current: null, error: null, message: null }),
}));

