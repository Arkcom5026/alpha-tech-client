// ✅ src/features/category/store/categoryStore.js
import { create } from 'zustand';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  archiveCategory,
  restoreCategory,
} from '../api/categoryApi';
import { parseApiError } from '@/utils/uiHelpers';

const initialState = {
  items: [],
  total: 0,
  page: 1,
  limit: 20,
  search: '',
  includeInactive: true,
  loading: false,
  submitting: false,
  error: null,
};

const MUTATION_BUSY_MESSAGE = 'กำลังบันทึกข้อมูลหมวดหมู่ กรุณารอสักครู่';

export const useCategoryStore = create((set, get) => ({
  ...initialState,

  setSearchAction: (search) => set({ search, page: 1 }),
  setPageAction: (page) => set({ page }),
  setLimitAction: (limit) => set({ limit, page: 1 }),
  setIncludeInactiveAction: (includeInactive) => set({ includeInactive, page: 1 }),

  fetchListAction: async () => {
    const { page, limit, search, includeInactive } = get();
    try {
      set({ loading: true, error: null });
      const data = await getCategories({ page, limit, search, includeInactive });
      set({ items: data.items || [], total: data.total || 0 });
    } catch (err) {
      const message = parseApiError(err);
      set({ error: message, items: [], total: 0 });
    } finally {
      set({ loading: false });
    }
  },

  refreshAction: async () => {
    await get().fetchListAction();
  },

  getCategoryAction: async (id) => {
    try {
      return await getCategoryById(id);
    } catch (err) {
      const message = parseApiError(err);
      set({ error: message });
      return null;
    }
  },

  createAction: async (payload) => {
    if (get().submitting) return { ok: false, message: MUTATION_BUSY_MESSAGE };
    try {
      set({ submitting: true, error: null });
      await createCategory(payload);
      await get().fetchListAction();
      return { ok: true };
    } catch (err) {
      const message = parseApiError(err);
      set({ error: message });
      return { ok: false, message };
    } finally {
      set({ submitting: false });
    }
  },

  updateAction: async (id, patch) => {
    if (get().submitting) return { ok: false, message: MUTATION_BUSY_MESSAGE };
    try {
      set({ submitting: true, error: null });
      await updateCategory(id, patch);
      await get().fetchListAction();
      return { ok: true };
    } catch (err) {
      const message = parseApiError(err);
      set({ error: message });
      return { ok: false, message };
    } finally {
      set({ submitting: false });
    }
  },

  archiveAction: async (id) => {
    if (get().submitting) return { ok: false, message: MUTATION_BUSY_MESSAGE };
    try {
      set({ submitting: true, error: null });
      await archiveCategory(id);
      await get().fetchListAction();
      return { ok: true };
    } catch (err) {
      const message = parseApiError(err);
      set({ error: message });
      return { ok: false, message };
    } finally {
      set({ submitting: false });
    }
  },

  restoreAction: async (id) => {
    if (get().submitting) return { ok: false, message: MUTATION_BUSY_MESSAGE };
    try {
      set({ submitting: true, error: null });
      await restoreCategory(id);
      await get().fetchListAction();
      return { ok: true };
    } catch (err) {
      const message = parseApiError(err);
      set({ error: message });
      return { ok: false, message };
    } finally {
      set({ submitting: false });
    }
  },
}));
