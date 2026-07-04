// src/features/productTemplate/store/productTemplateStore.js
// Mission C — Product Template Governance Store

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import * as productTemplateApi from '../api/productTemplateApi';
import * as templateImageApi from '../api/templateImageApi';

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.response?.data?.error || error?.message || fallback;

const initialState = {
  items: [],
  currentTemplate: null,
  masterOptions: { productTypes: [], brands: [], categories: [], units: [], errors: [] },
  page: 1,
  limit: 20,
  totalPages: 1,
  totalItems: 0,
  includeInactive: false,
  search: '',
  isLoading: false,
  isSaving: false,
  isUploadingImage: false,
  isLoadingMasters: false,
  error: null,
  lastQuery: null,
};

const useProductTemplateStore = create(devtools((set, get) => ({
  ...initialState,

  setPageAction: (n) => set({ page: Number(n) || 1 }),
  setLimitAction: (n) => set({ limit: Number(n) || 20 }),
  setIncludeInactiveAction: (v) => set({ includeInactive: !!v }),
  setSearchAction: (txt) => set({ search: txt ?? '' }),
  clearCurrentTemplateAction: () => set({ currentTemplate: null, error: null }),

  fetchMasterOptionsAction: async () => {
    set({ isLoadingMasters: true });
    try {
      const masterOptions = await productTemplateApi.getCatalogMasterOptions();
      set({ masterOptions });
      return masterOptions;
    } catch (error) {
      console.error('[productTemplateStore] fetchMasterOptionsAction error:', error);
      set({ error: getErrorMessage(error, 'ไม่สามารถโหลด Catalog Master ได้') });
      return null;
    } finally {
      set({ isLoadingMasters: false });
    }
  },

  fetchListAction: async (overrides = {}) => {
    const base = get();
    const page = Number(overrides.page ?? base.page) || 1;
    const limit = Number(overrides.limit ?? base.limit) || 20;
    const includeInactive = !!(overrides.includeInactive ?? base.includeInactive);
    const search = (overrides.search ?? base.search) ?? '';
    const params = { page, limit, includeInactive, search: String(search || '') || undefined };

    set({ page, limit, includeInactive, search, isLoading: true, error: null, lastQuery: params });
    try {
      const res = await productTemplateApi.getProductTemplates(params);
      const { items = [], totalPages = 1, totalItems = 0 } = res || {};
      set({ items, totalPages: Number(totalPages) || 1, totalItems: Number(totalItems) || items.length });
      return res;
    } catch (error) {
      console.error('[productTemplateStore] fetchListAction error:', error);
      set({ error: getErrorMessage(error, 'ไม่สามารถโหลดข้อมูลได้') });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  refreshTemplatesAction: async () => {
    const base = get();
    return base.fetchListAction(base.lastQuery || { page: base.page, limit: base.limit, includeInactive: base.includeInactive, search: base.search });
  },

  getTemplateByIdAction: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const template = await productTemplateApi.getProductTemplateById(id);
      set({ currentTemplate: template });
      return template;
    } catch (error) {
      console.error('[productTemplateStore] getTemplateByIdAction error:', error);
      set({ error: getErrorMessage(error, 'ไม่สามารถดึงข้อมูลได้') });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  addTemplateAction: async (data) => {
    set({ isSaving: true, error: null });
    try {
      const newTemplate = await productTemplateApi.createProductTemplate(data);
      await get().refreshTemplatesAction();
      return newTemplate;
    } catch (error) {
      console.error('[productTemplateStore] addTemplateAction error:', error);
      set({ error: getErrorMessage(error, 'ไม่สามารถเพิ่มข้อมูลได้') });
      return null;
    } finally {
      set({ isSaving: false });
    }
  },

  updateTemplateAction: async (id, data) => {
    set({ isSaving: true, error: null });
    try {
      const updated = await productTemplateApi.updateProductTemplate(id, data);
      set({ currentTemplate: updated });
      await get().refreshTemplatesAction();
      return updated;
    } catch (error) {
      console.error('[productTemplateStore] updateTemplateAction error:', error);
      set({ error: getErrorMessage(error, 'ไม่สามารถอัปเดตข้อมูลได้') });
      return null;
    } finally {
      set({ isSaving: false });
    }
  },

  uploadTemplateImageAction: async (id, file) => {
    if (!id || !file) return null;
    set({ isUploadingImage: true, error: null });
    try {
      await templateImageApi.uploadTemplateImage(id, file);
      return await get().getTemplateByIdAction(id);
    } catch (error) {
      console.error('[productTemplateStore] uploadTemplateImageAction error:', error);
      set({ error: getErrorMessage(error, 'ไม่สามารถอัปโหลดรูป Template ได้') });
      return null;
    } finally {
      set({ isUploadingImage: false });
    }
  },

  deleteTemplateImageAction: async (id, image) => {
    if (!id || !image) return null;
    set({ isUploadingImage: true, error: null });
    try {
      await templateImageApi.deleteTemplateImage(id, image);
      return await get().getTemplateByIdAction(id);
    } catch (error) {
      console.error('[productTemplateStore] deleteTemplateImageAction error:', error);
      set({ error: getErrorMessage(error, 'ไม่สามารถลบรูป Template ได้') });
      return null;
    } finally {
      set({ isUploadingImage: false });
    }
  },

  setTemplateCoverImageAction: async (id, imageId) => {
    if (!id || !imageId) return null;
    set({ isUploadingImage: true, error: null });
    try {
      await templateImageApi.setTemplateCoverImage(id, imageId);
      return await get().getTemplateByIdAction(id);
    } catch (error) {
      console.error('[productTemplateStore] setTemplateCoverImageAction error:', error);
      set({ error: getErrorMessage(error, 'ไม่สามารถตั้งรูปปก Template ได้') });
      return null;
    } finally {
      set({ isUploadingImage: false });
    }
  },

  archiveTemplateAction: async (id) => {
    set({ isSaving: true, error: null });
    try {
      const updated = await productTemplateApi.archiveProductTemplate(id);
      set({ currentTemplate: updated });
      await get().refreshTemplatesAction();
      return updated;
    } catch (error) {
      set({ error: getErrorMessage(error, 'ไม่สามารถปิดใช้งาน Template ได้') });
      return null;
    } finally {
      set({ isSaving: false });
    }
  },

  restoreTemplateAction: async (id) => {
    set({ isSaving: true, error: null });
    try {
      const updated = await productTemplateApi.restoreProductTemplate(id);
      set({ currentTemplate: updated });
      await get().refreshTemplatesAction();
      return updated;
    } catch (error) {
      set({ error: getErrorMessage(error, 'ไม่สามารถเปิดใช้งาน Template ได้') });
      return null;
    } finally {
      set({ isSaving: false });
    }
  },

  toggleActiveAction: async (id) => {
    set({ isSaving: true, error: null });
    try {
      const updated = await productTemplateApi.toggleActive(id);
      set({ currentTemplate: updated });
      await get().refreshTemplatesAction();
      return updated;
    } catch (error) {
      set({ error: getErrorMessage(error, 'ไม่สามารถเปลี่ยนสถานะได้') });
      return null;
    } finally {
      set({ isSaving: false });
    }
  },

  resetFiltersAction: () => set({ page: 1, includeInactive: false, search: '', lastQuery: null }),
})), { name: 'product-template-governance-store' });

export default useProductTemplateStore;
