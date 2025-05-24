// ✅ src/features/productTemplate/store/productTemplateStore.js

import { create } from 'zustand';
import { getAllProductTemplates } from '../api/productTemplateApi';


export const useProductTemplateStore = create((set) => ({
  templates: [],
  loading: false,
  error: null,

  fetchTemplates: async () => {
    set({ loading: true });
    try {
      const data = await getAllProductTemplates();
      set({ templates: data, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },
}));