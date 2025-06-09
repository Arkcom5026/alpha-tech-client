// 📁 src/features/sale/store/saleStore.js

import { create } from 'zustand';
import apiClient from '@/utils/apiClient';

const useSaleStore = create((set, get) => ({
  // ...ฟังก์ชันอื่นๆ เช่น loadSalesAction, confirmSaleOrderAction

  getPrintableSaleByIdAction: async (id) => {
    try {
      const res = await apiClient.get(`/sales/${id}`);
      return res.data;
    } catch (error) {
      console.error('❌ [getPrintableSaleByIdAction] error:', error);
      return null;
    }
  },
}));

export default useSaleStore;
