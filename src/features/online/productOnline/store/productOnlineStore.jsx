// ✅ อัปเดตฟังก์ชันใน Store ให้รับ filters และ branchId

import { create } from 'zustand';
import {
  getProductsForOnline,
  getProductOnlineById,
  clearOnlineProductCache,
  getProductDropdownsForOnline,
} from '../api/productOnlineApi';

export const useProductOnlineStore = create((set, get) => ({
  products: [],
  selectedProduct: null,
  isLoading: false,
  error: null,
  dropdowns: null,

  filters: {
    categoryId: '',
    productTypeId: '',
    productProfileId: '',
    templateId: '',
  },
  setFilters: (newFilters) => set({ filters: newFilters }),

  loadProductsAction: async (filters = {}) => {
    console.log('[STORE] 🔄 loadProductsAction called with filters:', filters);
    set({ isLoading: true, error: null });
    try {
      const data = await getProductsForOnline(filters);
      set({ products: data, isLoading: false });
    } catch (err) {
      console.error('❌ โหลดสินค้าออนไลน์ล้มเหลว:', err);
      set({ error: 'ไม่สามารถโหลดสินค้าออนไลน์ได้', isLoading: false });
    }
  },

  getProductByIdAction: async (id, branchId) => {
    const parsedBranchId = Number(branchId);
    if (isNaN(parsedBranchId) || parsedBranchId <= 0) {
      console.warn('❗ ไม่พบ branchId หรือไม่ถูกต้อง:', branchId);
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const data = await getProductOnlineById(Number(id), parsedBranchId);
      set({ selectedProduct: data, isLoading: false });
    } catch (err) {
      console.error('❌ โหลดสินค้ารายการเดียวล้มเหลว:', err);
      set({ error: 'ไม่สามารถโหลดสินค้านี้ได้', isLoading: false });
    }
  },

  searchProductsAction: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getProductsForOnline(filters);
      set({ products: data, isLoading: false });
    } catch (err) {
      console.error('❌ ค้นหาสินค้าออนไลน์ล้มเหลว:', err);
      set({ error: 'ไม่สามารถค้นหาสินค้าได้', isLoading: false });
    }
  },

  loadDropdownsAction: async () => {
    try {
      const dropdowns = await getProductDropdownsForOnline();
      set({ dropdowns });
    } catch (err) {
      console.error('❌ โหลด dropdowns สินค้าออนไลน์ล้มเหลว:', err);
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
  },

  // ✅ เพิ่ม branchId สำหรับ context ใน Store
  selectedBranchId: null,
  setSelectedBranchId: (id) => set({ selectedBranchId: id }),
}));
