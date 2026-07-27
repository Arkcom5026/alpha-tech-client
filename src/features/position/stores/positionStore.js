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
import { normalizeRuntimeError, withLoading } from '@/runtime';

const POSITION_LOADING_KEYS = {
  fetchList: 'position.fetchList',
  fetchDropdowns: 'position.fetchDropdowns',
  fetchById: 'position.fetchById',
  create: 'position.create',
  update: 'position.update',
  updateRole: 'position.updateRole',
  toggleActive: 'position.toggleActive',
};

export const usePositionStore = create((set) => ({
  list: [],
  meta: { page: 1, limit: 20, total: 0, pages: 0 },
  dropdowns: [],
  current: null,
  loading: false,
  error: null,
  message: null,
  roles: ['employee', 'admin'],

  fetchListAction: async (params = {}) => {
    try {
      set({ loading: true, error: null, message: null });
      const data = await withLoading(POSITION_LOADING_KEYS.fetchList, () => getPositions(params));

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
    } catch (error) {
      set({ loading: false, error: normalizeRuntimeError(error) });
      return null;
    }
  },

  fetchDropdownsAction: async (active = true) => {
    try {
      const items = await withLoading(POSITION_LOADING_KEYS.fetchDropdowns, () => getPositionDropdowns(active));
      set({ dropdowns: items || [] });
      return items;
    } catch (error) {
      set({ error: normalizeRuntimeError(error) });
      return [];
    }
  },

  fetchByIdAction: async (id) => {
    try {
      set({ loading: true, error: null });
      const item = await withLoading(POSITION_LOADING_KEYS.fetchById, () => getPositionById(id));
      const normalized = item
        ? { ...item, role: item?.role ?? item?.defaultRole ?? item?.systemRole ?? null }
        : null;
      set({ current: normalized, loading: false });
      return normalized;
    } catch (error) {
      set({ loading: false, error: normalizeRuntimeError(error) });
      return null;
    }
  },

  createAction: async (payload) => {
    try {
      set({ loading: true, error: null, message: null });
      const created = await withLoading(POSITION_LOADING_KEYS.create, () => createPosition(payload));
      set({ loading: false, message: 'สร้างตำแหน่งเรียบร้อย' });
      return created;
    } catch (error) {
      set({ loading: false, error: normalizeRuntimeError(error) });
      return null;
    }
  },

  updateAction: async (id, payload) => {
    try {
      set({ loading: true, error: null, message: null });
      const updated = await withLoading(POSITION_LOADING_KEYS.update, () => updatePosition(id, payload));
      const normalized = updated
        ? { ...updated, role: updated?.role ?? updated?.defaultRole ?? updated?.systemRole ?? null }
        : null;

      set((state) => ({
        list: state.list.map((it) => (it.id === id ? { ...it, ...normalized } : it)),
        loading: false,
        message: 'บันทึกการแก้ไขเรียบร้อย',
      }));
      return normalized;
    } catch (error) {
      set({ loading: false, error: normalizeRuntimeError(error) });
      return null;
    }
  },

  updateRoleAction: async (id, role) => {
    try {
      const allowed = ['admin', 'employee'];
      if (!allowed.includes(String(role))) {
        throw new Error('Allowed role: admin หรือ employee เท่านั้น');
      }

      set({ loading: true, error: null, message: null });
      const updated = await withLoading(POSITION_LOADING_KEYS.updateRole, () => updatePosition(id, { role }));
      const normalized = updated
        ? { ...updated, role: updated?.role ?? updated?.defaultRole ?? updated?.systemRole ?? null }
        : null;

      set((state) => ({
        list: state.list.map((it) => (it.id === id ? { ...it, ...normalized } : it)),
        loading: false,
        message: 'อัปเดต Role สำเร็จ',
      }));
      return normalized;
    } catch (error) {
      set({ loading: false, error: normalizeRuntimeError(error) });
      return null;
    }
  },

  toggleActiveAction: async (id) => {
    try {
      set({ loading: true, error: null, message: null });
      const updated = await withLoading(POSITION_LOADING_KEYS.toggleActive, () => toggleActivePosition(id));
      const normalized = updated
        ? { ...updated, role: updated?.role ?? updated?.defaultRole ?? updated?.systemRole ?? null }
        : null;

      set((state) => ({
        list: state.list.map((it) => (it.id === id ? { ...it, ...normalized } : it)),
        loading: false,
        message: 'อัปเดตสถานะสำเร็จ',
      }));
      return normalized;
    } catch (error) {
      set({ loading: false, error: normalizeRuntimeError(error) });
      return null;
    }
  },

  resetCurrentAction: () => set({ current: null, error: null, message: null }),
}));
