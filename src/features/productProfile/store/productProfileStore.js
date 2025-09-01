// src/features/productProfile/store/productProfileStore.js
import { create } from 'zustand';
import {
  getProductProfiles,
  getProductProfileById,
  createProductProfile,
  updateProductProfile,
  deleteProductProfile,
} from '../api/productProfileApi';
import { parseApiError } from '@/utils/uiHelpers';

const useProductProfileStore = create((set, get) => ({
  // ---------- State (list + filters + paging) ----------
  items: [],
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
  search: '',
  includeInactive: false,
  categoryId: null,
  productTypeId: null,

  current: null,
  isLoading: false,
  isLoadingCurrent: false,
  isSubmitting: false,
  error: null,

  setPageAction: (page) => set({ page }),
  setSearchAction: (search) => set({ search, page: 1 }),
  setIncludeInactiveAction: (includeInactive) => set({ includeInactive, page: 1 }),
  setCategoryFilterAction: (categoryId) => set({ categoryId, page: 1 }),
  setProductTypeFilterAction: (productTypeId) => set({ productTypeId, page: 1 }),
  setLimitAction: (limit) => set({ limit, page: 1 }),
  clearCurrentAction: () => set({ current: null }),

  fetchListAction: async () => {
    const { page, limit, search, includeInactive, categoryId, productTypeId } = get();
    set({ isLoading: true, error: null });
    try {
      const res = await getProductProfiles({ page, limit, search, includeInactive, categoryId, productTypeId });
      const payload = res?.data ?? res;

      const pick = (obj, paths) => {
        for (const p of paths) {
          try {
            const v = p.split('.').reduce((a, k) => (a && a[k] !== undefined ? a[k] : undefined), obj);
            if (v !== undefined) return v;
          } catch {
            // ignore error
          }
        }
        return undefined;
      };

      let items = pick(payload, ['items','rows','results','list','data']) ?? (Array.isArray(payload) ? payload : []);
      if (!Array.isArray(items) && Array.isArray(payload?.data)) items = payload.data;

      const total = Number(
        pick(payload, ['total','count','meta.total','pagination.total']) ??
        (Array.isArray(items) ? items.length : 0)
      );
      const totalPages = Number(
        pick(payload, ['totalPages','pages','meta.totalPages','pagination.totalPages']) ??
        (total && limit ? Math.ceil(total / Number(limit)) : 1)
      );

      set({
        items: Array.isArray(items) ? items : [],
        total: Number.isFinite(total) ? total : 0,
        totalPages: Number.isFinite(totalPages) ? totalPages : 1,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false, error: parseApiError(err) });
      throw err;
    }
  },

  fetchProfileById: async (id) => {
    set({ isLoadingCurrent: true, error: null });
    try {
      const res = await getProductProfileById(id);
      const payload = res?.data ?? res;

      console.log('[ProfileById] raw res:', res);
      console.log('[ProfileById] payload keys:', payload && Object.keys(payload || {}));

      const pick = (obj, paths) => {
        for (const p of paths) {
          try {
            const v = p.split('.').reduce((a, k) => (a && a[k] !== undefined ? a[k] : undefined), obj);
            if (v !== undefined) return v;
          } catch {
            // ignore error
          }
        }
        return undefined;
      };

      let entity = pick(payload, ['item','profile','productProfile','result','record','data']);
      if (!entity && Array.isArray(payload)) entity = payload[0];
      if (!entity && payload && typeof payload === 'object' && !Array.isArray(payload)) entity = payload;

      if (!entity || (entity && typeof entity === 'object' && Object.keys(entity).length === 0)) {
        set({ current: null, isLoadingCurrent: false });
        return null;
      }

      set({ current: entity, isLoadingCurrent: false });
      return entity;
    } catch (err) {
      set({ isLoadingCurrent: false, error: parseApiError(err) });
      throw err;
    }
  },

  createProfile: async (payload) => {
    set({ isSubmitting: true, error: null });
    try {
      const created = await createProductProfile(payload);
      set({ isSubmitting: false });
      await get().fetchListAction();
      return created;
    } catch (err) {
      set({ isSubmitting: false, error: parseApiError(err) });
      throw err;
    }
  },

  updateProfile: async (id, payload) => {
    set({ isSubmitting: true, error: null });
    try {
      const updated = await updateProductProfile(id, payload);
      set({ isSubmitting: false });
      await get().fetchListAction();
      return updated;
    } catch (err) {
      set({ isSubmitting: false, error: parseApiError(err) });
      throw err;
    }
  },

  deleteProfile: async (id) => {
    set({ isSubmitting: true, error: null });
    try {
      await deleteProductProfile(id);
      set({ isSubmitting: false });
      await get().fetchListAction();
      return true;
    } catch (err) {
      set({ isSubmitting: false, error: parseApiError(err) });
      throw err;
    }
  },
}));

export default useProductProfileStore;
