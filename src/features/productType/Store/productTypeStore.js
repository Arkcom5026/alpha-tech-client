import { create } from 'zustand';
import { getProductTypes } from '../api/productTypeApi';

export const useProductTypeStore = create((set) => ({
  productTypes: [],

  fetchProductTypes: async () => {
    try {
      const data = await getProductTypes();
      console.log('✅ โหลดได้:', data);
      set({ productTypes: data });
    } catch (err) {
      console.error('❌ โหลดประเภทสินค้าไม่สำเร็จ:', err);
    }
  },
}));
