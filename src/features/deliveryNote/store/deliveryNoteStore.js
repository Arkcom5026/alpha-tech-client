// ✅ deliveryNoteStore.js
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { searchPrintablePayments } from '../api/deliveryNoteApi';

const useDeliveryNoteStore = create(
  devtools((set) => ({
    printablePayments: [],

    loadPrintablePaymentsAction: async (query = {}) => {
      try {
        const data = await searchPrintablePayments(query);
        set({ printablePayments: data });
      } catch (err) {
        console.error('❌ โหลด printablePayments ล้มเหลว:', err);
      }
    },
  }))
);

export default useDeliveryNoteStore;
