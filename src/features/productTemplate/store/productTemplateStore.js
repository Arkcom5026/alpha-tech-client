
// ✅ src/features/productTemplate/store/productTemplateStore.js
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import * as productTemplateApi from '../api/productTemplateApi';

const initialState = {
  items: [],
  currentTemplate: null,
  page: 1,
  limit: 20,
  totalPages: 1,
  totalItems: 0,
  includeInactive: false,
  categoryId: null,
  productTypeId: null,
  productProfileId: null,
  search: '',
  isLoading: false,
  error: null,
  lastQuery: null,
};

const useProductTemplateStore = create(devtools((set, get) => ({
  ...initialState,

  // ✅ setters (Action suffix)
  setPageAction: (n) => set({ page: Number(n) || 1 }),
  setLimitAction: (n) => set({ limit: Number(n) || 20 }),
  setIncludeInactiveAction: (v) => set({ includeInactive: !!v }),
  setCategoryFilterAction: (v) => set({ categoryId: v ?? null }),
  setProductTypeFilterAction: (v) => set({ productTypeId: v ?? null }),
  setProductProfileFilterAction: (v) => set({ productProfileId: v ?? null }),
  setSearchAction: (txt) => set({ search: txt ?? '' }),

  // ✅ fetch list
  fetchListAction: async () => {
    const { page, limit, includeInactive, categoryId, productTypeId, productProfileId, search } = get();
    set({ isLoading: true, error: null });
    try {
      const params = {
        page,
        limit,
        includeInactive,
        categoryId: categoryId ?? undefined,
        productTypeId: productTypeId ?? undefined,
        productProfileId: productProfileId ?? undefined,
        search: search || undefined,
      };
      const res = await productTemplateApi.getProductTemplates(params);
      const { items = [], totalPages = 1, totalItems = 0 } = res || {};
      set({ items, totalPages: Number(totalPages) || 1, totalItems: Number(totalItems) || items.length });
    } catch (e) {
      console.error('[productTemplateStore] fetchListAction error:', e);
      set({ error: e?.message || 'ไม่สามารถโหลดข้อมูลได้' });
    } finally {
      set({ isLoading: false });
    }
  },

  // ✅ refresh current list with lastQuery
  refreshTemplatesAction: async () => {
    await get().fetchListAction();
  },

  // ✅ get by id
  getTemplateByIdAction: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const template = await productTemplateApi.getProductTemplateById(id);
      set({ currentTemplate: template });
      return template;
    } catch (e) {
      console.error('[productTemplateStore] getTemplateByIdAction error:', e);
      set({ error: e?.message || 'ไม่สามารถดึงข้อมูลได้' });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  // ✅ add
  addTemplateAction: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newTemplate = await productTemplateApi.createProductTemplate(data);
      await get().fetchListAction();
      return newTemplate;
    } catch (e) {
      console.error('[productTemplateStore] addTemplateAction error:', e);
      set({ error: e?.message || 'ไม่สามารถเพิ่มข้อมูลได้' });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  // ✅ update
  updateTemplateAction: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await productTemplateApi.updateProductTemplate(id, data);
      await get().fetchListAction();
      return true;
    } catch (e) {
      console.error('[productTemplateStore] updateTemplateAction error:', e);
      set({ error: e?.message || 'ไม่สามารถอัปเดตข้อมูลได้' });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // ✅ delete
  deleteTemplateAction: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await productTemplateApi.deleteProductTemplate(id);
      await get().fetchListAction();
      return true;
    } catch (e) {
      console.error('[productTemplateStore] deleteTemplateAction error:', e);
      set({ error: e?.message || 'ไม่สามารถลบข้อมูลได้' });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // ✅ toggle active
  toggleActiveAction: async (id) => {
    try {
      await productTemplateApi.toggleActive(id);
      await get().fetchListAction();
    } catch (e) {
      console.error('[productTemplateStore] toggleActiveAction error:', e);
      set({ error: e?.message || 'ไม่สามารถเปลี่ยนสถานะได้' });
    }
  },

  // ✅ reset filters
  resetFiltersAction: () => set({ categoryId: null, productTypeId: null, productProfileId: null, page: 1 }),
})))

export default useProductTemplateStore;
