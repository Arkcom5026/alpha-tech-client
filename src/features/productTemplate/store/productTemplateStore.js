
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
  setSearchAction: (txt) => set({ search: txt ?? '' }),

  // ✅ fetch list (supports override params from Page)
  fetchListAction: async (overrides = {}) => {
    const base = get();

    const page = Number(overrides.page ?? base.page) || 1;
    const limit = Number(overrides.limit ?? base.limit) || 20;
    const includeInactive = !!(overrides.includeInactive ?? base.includeInactive);
    const search = (overrides.search ?? base.search) ?? '';

    const params = {
      page,
      limit,
      includeInactive,
      search: String(search || '') || undefined,
    };

    set({
      page,
      limit,
      includeInactive,
      search,
      isLoading: true,
      error: null,
      lastQuery: params,
    });

    try {
      const res = await productTemplateApi.getProductTemplates(params);
      const { items = [], totalPages = 1, totalItems = 0 } = res || {};
      set({
        items,
        totalPages: Number(totalPages) || 1,
        totalItems: Number(totalItems) || items.length,
      });
    } catch (e) {
      console.error('[productTemplateStore] fetchListAction error:', e);
      set({ error: e?.message || 'ไม่สามารถโหลดข้อมูลได้' });
    } finally {
      set({ isLoading: false });
    }
  },

  // ✅ refresh current list with lastQuery (or current state)
  refreshTemplatesAction: async () => {
    const base = get();
    const { lastQuery } = base;

    if (lastQuery) return await base.fetchListAction(lastQuery);

    // fall back to current state (prevents recursion)
    return await base.fetchListAction({
      page: base.page,
      limit: base.limit,
      includeInactive: base.includeInactive,
      search: base.search,
    });
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
      await get().refreshTemplatesAction();
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
      await get().refreshTemplatesAction();
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
      await get().refreshTemplatesAction();
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
      await get().refreshTemplatesAction();
    } catch (e) {
      console.error('[productTemplateStore] toggleActiveAction error:', e);
      set({ error: e?.message || 'ไม่สามารถเปลี่ยนสถานะได้' });
    }
  },

  // ✅ reset filters
  resetFiltersAction: () =>
    set({
      page: 1,
      includeInactive: false,
      search: '',
      lastQuery: null,
    }),
}))
);

export default useProductTemplateStore;


