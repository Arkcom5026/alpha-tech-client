
// ✅ src/features/productTemplate/store/productTemplateStore.js

import { create } from 'zustand';
import {
  getAllProductTemplates,
  createProductTemplate,
  updateProductTemplate,
  deleteProductTemplate,
  getProductTemplateById,
} from '../api/productTemplateApi';

const useProductTemplateStore = create((set) => ({
  templates: [],
  currentTemplate: null,
  isLoading: false,
  error: null,

  fetchTemplates: async () => {
    set({ isLoading: true, error: null });
    try {
      const templates = await getAllProductTemplates();
      set({ templates, isLoading: false });
    } catch (error) {
      console.error('❌ fetchTemplates error:', error);
      set({ error: 'ไม่สามารถโหลดข้อมูลได้', isLoading: false });
    }
  },

  getTemplateById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const template = await getProductTemplateById(id);
      set({ currentTemplate: template, isLoading: false });
      console.log('📦 getTemplateById response------------------------------- :', template);
      return template;
    } catch (error) {
      console.error('❌ getTemplateById error:', error);
      set({ error: 'ไม่สามารถดึงข้อมูลได้', isLoading: false });
      return null;
    }
  },

  addTemplate: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newTemplate = await createProductTemplate(data);
      set((state) => ({
        templates: [newTemplate, ...state.templates],
        isLoading: false,
      }));
      return newTemplate;
    } catch (error) {
      console.error('❌ addTemplate error:', error);
      set({ error: 'ไม่สามารถเพิ่มข้อมูลได้', isLoading: false });
      return null;
    }
  },

  updateTemplate: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updateProductTemplate(id, data);
      set((state) => ({
        templates: state.templates.map((t) => (t.id === id ? updated : t)),
        isLoading: false,
      }));
      return updated;
    } catch (error) {
      console.error('❌ updateTemplate error:', error);
      set({ error: 'ไม่สามารถอัปเดตข้อมูลได้', isLoading: false });
      return null;
    }
  },

  deleteTemplate: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await deleteProductTemplate(id);
      set((state) => ({
        templates: state.templates.filter((t) => t.id !== id),
        isLoading: false,
      }));
      return true;
    } catch (error) {
      console.error('❌ deleteTemplate error:', error);
      set({ error: 'ไม่สามารถลบข้อมูลได้', isLoading: false });
      return false;
    }
  },
}));

export default useProductTemplateStore;
