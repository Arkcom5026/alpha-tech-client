import { create } from 'zustand';
import {
  getAllOnlineProducts,
  getProductById,
  searchOnlineProducts,
  clearOnlineProductCache
} from '../api/productOnlineApi';

export const useProductOnlineStore = create((set, get) => ({
  products: [],
  selectedProduct: null,
  isLoading: false,
  error: null,

  loadProductsAction: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getAllOnlineProducts();
      console.log('loadProductsAction : ', data)
      set({ products: data, isLoading: false });
    } catch (err) {
      console.error('❌ โหลดสินค้าออนไลน์ล้มเหลว:', err);
      set({ error: 'ไม่สามารถโหลดสินค้าออนไลน์ได้', isLoading: false });
    }
  },

  getProductByIdAction: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getProductById(id);
      set({ selectedProduct: data, isLoading: false });
    } catch (err) {
      console.error('❌ โหลดสินค้ารายการเดียวล้มเหลว:', err);
      set({ error: 'ไม่สามารถโหลดสินค้านี้ได้', isLoading: false });
    }
  },

  searchProductsAction: async (query) => {
    set({ isLoading: true, error: null });
    try {
      const data = await searchOnlineProducts(query);
      set({ products: data, isLoading: false });
    } catch (err) {
      console.error('❌ ค้นหาสินค้าออนไลน์ล้มเหลว:', err);
      set({ error: 'ไม่สามารถค้นหาสินค้าได้', isLoading: false });
    }
  },

  clearProductsAction: () => set({ products: [] }),
  clearSelectedProductAction: () => set({ selectedProduct: null }),

  clearProductCacheAction: async () => {
    try {
      await clearOnlineProductCache();
    } catch (err) {
      console.error('❌ ล้างแคชสินค้าล้มเหลว:', err);
    }
  }
}));