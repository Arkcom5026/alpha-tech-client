// ✅ Store: saleReturnStore.js

import { getSaleReturns } from '@/features/sales/api/saleApi';
import { create } from 'zustand';
import { createSaleReturn, getAllSaleReturns, getSaleReturnById } from '../api/saleReturnApi';

const useSaleReturnStore = create((set) => ({
  returnableSales: [],
  saleReturns: [],
  selectedSaleReturn: null,
  loading: false,

  loadReturnableSalesAction: async () => {
    try {
      const data = await getSaleReturns();
      set({ returnableSales: data });
    } catch (err) {
      console.error('❌ loadReturnableSalesAction error:', err);
    }
  },

  fetchSaleReturnsAction: async () => {
    try {
      set({ loading: true });
      const data = await getAllSaleReturns();
      console.log(' data : ',data)
      set({ saleReturns: data, loading: false });
    } catch (err) {
      console.error('❌ fetchSaleReturnsAction error:', err);
      set({ loading: false });
    }
  },

  createSaleReturnAction: async (saleId, payload) => {
    try {
      const result = await createSaleReturn(saleId, payload);
      return result;
    } catch (err) {
      console.error('❌ createSaleReturnAction error:', err);
      throw err;
    }
  },

  getSaleReturnByIdAction: async (id) => {
    try {
      const data = await getSaleReturnById(id);
      set({ selectedSaleReturn: data });
      return data;
    } catch (err) {
      console.error('❌ getSaleReturnByIdAction error:', err);
      throw err;
    }
  },
}));

export default useSaleReturnStore;
