// ✅ src/features/category/store/categoryStore.js
import { create } from 'zustand';
import { getCategories } from '../api/categoryTypeApi';


export const useCategoryStore = create((set) => ({
  categories: [],

  fetchCategories: async () => {
    try {
      const data = await getCategories();
      console.log('✅ โหลดหมวดหมู่:', data);
      set({ categories: data });
    } catch (err) {
      console.error('❌ โหลดหมวดหมู่ไม่สำเร็จ:', err);
    }
  },
}));