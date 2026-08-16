// ✅ Store: saleReturnStore.js

import { getSaleReturns } from '@/features/sales/api/saleApi';
import { create } from 'zustand';
import { createSaleReturn, getAllSaleReturns, getSaleReturnById } from '../api/saleReturnApi';

const useSaleReturnStore = create((set, get) => ({
  returnableSales: [],
  saleReturns: [],
  selectedSaleReturn: null,
  loading: false,
  error: null,

  clearErrorAction: () => set({ error: null }),

  loadReturnableSalesAction: async () => {
    try {
      const data = await getSaleReturns();
      set({ returnableSales: data, error: null });
      return data;
    } catch (err) {
      set({ error: err?.message || 'โหลดรายการขายที่คืนได้ไม่สำเร็จ' });
      throw err;
    }
  },

  fetchSaleReturnsAction: async () => {
    if (get().loading) return null;
    try {
      set({ loading: true, error: null });
      const data = await getAllSaleReturns();
      set({ saleReturns: data });
      return data;
    } catch (err) {
      set({ error: err?.message || 'โหลดรายการคืนสินค้าไม่สำเร็จ' });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  createSaleReturnAction: async (saleId, payload) => {
    if (get().loading) return null;
    try {
      set({ loading: true, error: null });
      const result = await createSaleReturn(saleId, payload);
      return result;
    } catch (err) {
      set({ error: err?.message || 'สร้างใบคืนสินค้าไม่สำเร็จ' });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  getSaleReturnByIdAction: async (id) => {
    try {
      const data = await getSaleReturnById(id);
      set({ selectedSaleReturn: data, error: null });
      return data;
    } catch (err) {
      set({ error: err?.message || 'โหลดข้อมูลใบคืนสินค้าไม่สำเร็จ' });
      throw err;
    }
  },
}));

export default useSaleReturnStore;
