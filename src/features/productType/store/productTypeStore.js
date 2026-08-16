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

const useProductTypeStore = create(
  devtools((set, get) => ({
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

    _setStateAction: (partial) => set(partial),
    setPageAction: (page) => set({ page }),
    setLimitAction: (limit) => set({ limit }),
    setSearchAction: (search) => set({ search }),
    setIncludeInactiveAction: (includeInactive) => set({ includeInactive }),
    setCategoryFilterAction: (categoryId) => set({ categoryId, page: 1 }),
    clearCurrentAction: () => set({ current: null }),
    resetFiltersAction: () =>
      set({ page: 1, limit: 20, search: '', includeInactive: false, categoryId: null }),

    fetchListAction: async () => {
      const { page, limit, search, includeInactive, categoryId } = get();
      set({ isLoading: true, error: null });
      try {
        const res = await getProductTypes({ page, limit, search, includeInactive, categoryId });

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
        else if (Array.isArray(items?.list)) items = items.list;

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

    createProductTypeAction: async (payload) => {
      if (get().isSubmitting) return null;
      set({ isSubmitting: true, error: null });
      try {
        const created = await createProductType(payload);
        await get().fetchListAction();
        return created;
      } catch (err) {
        set({ error: parseApiError(err) });
        throw err;
      } finally {
        set({ isSubmitting: false });
      }
    },

    updateProductTypeAction: async (id, payload) => {
      if (get().isSubmitting) return null;
      set({ isSubmitting: true, error: null });
      try {
        const updated = await updateProductType(id, payload);
        await get().fetchListAction();
        return updated;
      } catch (err) {
        set({ error: parseApiError(err) });
        throw err;
      } finally {
        set({ isSubmitting: false });
      }
    },

    archiveProductTypeAction: async (id) => {
      if (get().isSubmitting) return false;
      set({ isSubmitting: true, error: null });
      try {
        await archiveProductType(id);
        await get().fetchListAction();
        return true;
      } catch (err) {
        set({ error: parseApiError(err) });
        throw err;
      } finally {
        set({ isSubmitting: false });
      }
    },

    restoreProductTypeAction: async (id) => {
      if (get().isSubmitting) return false;
      set({ isSubmitting: true, error: null });
      try {
        await restoreProductType(id);
        await get().fetchListAction();
        return true;
      } catch (err) {
        set({ error: parseApiError(err) });
        throw err;
      } finally {
        set({ isSubmitting: false });
      }
    },
  }))
);

export default useProductTypeStore;
