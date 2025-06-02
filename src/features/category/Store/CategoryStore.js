// ✅ src/features/category/store/categoryStore.js
import { create } from 'zustand';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../api/categoryApi';

export const useCategoryStore = create((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getCategories();

      set({ categories: data });
    } catch (err) {
      console.error('❌ โหลดหมวดหมู่ไม่สำเร็จ:', err);
      set({ error: err });
    } finally {
      set({ isLoading: false });
    }
  },

  getCategory: async (id) => {
    try {
      return await getCategoryById(id);
    } catch (err) {
      console.error('❌ ไม่สามารถดึงหมวดหมู่ id:', id, err);
      return null;
    }
  },

  addCategory: async (data) => {
    try {
      console.log('📤 ส่งข้อมูลเพิ่มหมวดหมู่:', data);
      const created = await createCategory(data);
      console.log('✅ หมวดหมู่ที่สร้าง:', created);
      await get().fetchCategories();
      return created;
    } catch (err) {
      console.error('❌ เพิ่มหมวดหมู่ไม่สำเร็จ:', err);
      throw err;
    }
  },

  editCategory: async (id, data) => {
    try {
      await updateCategory(id, data);
      await get().fetchCategories();
    } catch (err) {
      console.error('❌ อัปเดตหมวดหมู่ไม่สำเร็จ:', err);
      throw err;
    }
  },

  removeCategory: async (id) => {
    try {
      await deleteCategory(id);
      await get().fetchCategories();
    } catch (err) {
      console.error('❌ ลบหมวดหมู่ไม่สำเร็จ:', err);
      throw err;
    }
  },
}));
