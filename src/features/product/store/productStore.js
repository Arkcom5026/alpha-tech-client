// ✅ productStore.js

import { create } from 'zustand';

export const useProductStore = create((set) => ({
  templates: [],
  profiles: [],
  units: [],
  categories: [],

  setTemplates: (data) => set({ templates: data }),
  setProfiles: (data) => set({ profiles: data }),
  setUnits: (data) => set({ units: data }),
  setCategories: (data) => set({ categories: data }),
}));
