import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  getProductTypes,
  getProductTypeById,
  createProductType,
  updateProductType,
  archiveProductType,
  restoreProductType,
} from '../api/productTypeApi';
import { parseApiError } from '@/utils/uiHelpers';

// ✅ Standardized Product Type Store (Production-ready)
// - No hard delete (archive/restore only)
// - All API calls via productTypeApi
// - Actions suffixed with `Action`
// - try...catch everywhere + parseApiError
// - Supports page, limit, search, includeInactive, categoryId

const useProductTypeStore = create(
  devtools((set, get) => ({
    // ---------- State ----------
    items: [],
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    search: '',
    includeInactive: false,
    categoryId: null,

    current: null,

    isLoading: false,
    isSubmitting: false,
    error: null,

    // ---------- Helpers ----------
    _setStateAction: (partial) => set(partial),

    // ---------- Filters / Pagination ----------
    setPageAction: (page) => set({ page }),
    setLimitAction: (limit) => set({ limit }),
    setSearchAction: (search) => set({ search }),
    setIncludeInactiveAction: (includeInactive) => set({ includeInactive }),
    setCategoryFilterAction: (categoryId) => set({ categoryId, page: 1 }),
    clearCurrentAction: () => set({ current: null }),
    resetFiltersAction: () =>
      set({ page: 1, limit: 20, search: '', includeInactive: false, categoryId: null }),

    // ---------- Queries ----------
    // Normalize response shape from BE (items/data/rows/results, total/count, totalPages/pages/pagination)
    fetchListAction: async () => {
      const { page, limit, search, includeInactive, categoryId } = get();
      set({ isLoading: true, error: null });
      try {
        const res = await getProductTypes({ page, limit, search, includeInactive, categoryId });

        // ---- Normalize various BE response shapes (deep-safe) ----
        const pick = (obj, paths = []) => {
          for (const p of paths) {
            try {
              const v = p
                .split('.')
                .reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : undefined), obj);
              if (v !== undefined) return v;
            } catch { 
              // ignore
            }
          }
          return undefined;
        };

        const payload = res?.data ?? res;

        let items = pick(payload, [
          'items',
          'data',
          'rows',
          'result',
          'results',
          'list',
          'records',
          'payload',
          'data.items',
          'data.rows',
          'data.result',
          'data.results',
          'data.list',
          'data.records',
          'result.items',
          'result.rows',
          'results.items',
        ]);

        if (Array.isArray(payload)) items = payload;
        else if (Array.isArray(payload?.data)) items = payload.data;
        else if (Array.isArray(items?.list)) items = items.list; // guard for nested list

        const total = Number(
          pick(payload, [
            'total',
            'count',
            'data.total',
            'data.count',
            'pagination.total',
            'meta.total',
            'meta.count',
          ]) ?? (Array.isArray(items) ? items.length : 0)
        );

        const totalPages = Number(
          pick(payload, [
            'totalPages',
            'pages',
            'data.totalPages',
            'data.pages',
            'pagination.totalPages',
            'meta.totalPages',
          ]) ?? (total && limit ? Math.ceil(total / Number(limit)) : 1)
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

    fetchByIdAction: async (id) => {
      set({ isLoading: true, error: null });
      try {
        const data = await getProductTypeById(id);
        set({ current: data, isLoading: false });
        return data;
      } catch (err) {
        set({ isLoading: false, error: parseApiError(err) });
        throw err;
      }
    },

    // ---------- Mutations ----------
    createProductTypeAction: async (payload) => {
      set({ isSubmitting: true, error: null });
      try {
        const created = await createProductType(payload);
        set({ isSubmitting: false });
        await get().fetchListAction();
        return created;
      } catch (err) {
        set({ isSubmitting: false, error: parseApiError(err) });
        throw err;
      }
    },

    updateProductTypeAction: async (id, payload) => {
      set({ isSubmitting: true, error: null });
      try {
        const updated = await updateProductType(id, payload);
        set({ isSubmitting: false });
        await get().fetchListAction();
        return updated;
      } catch (err) {
        set({ isSubmitting: false, error: parseApiError(err) });
        throw err;
      }
    },

    archiveProductTypeAction: async (id) => {
      set({ isSubmitting: true, error: null });
      try {
        await archiveProductType(id);
        set({ isSubmitting: false });
        await get().fetchListAction();
      } catch (err) {
        set({ isSubmitting: false, error: parseApiError(err) });
        throw err;
      }
    },

    restoreProductTypeAction: async (id) => {
      set({ isSubmitting: true, error: null });
      try {
        await restoreProductType(id);
        set({ isSubmitting: false });
        await get().fetchListAction();
      } catch (err) {
        set({ isSubmitting: false, error: parseApiError(err) });
        throw err;
      }
    },
  }))
);

export default useProductTypeStore;

