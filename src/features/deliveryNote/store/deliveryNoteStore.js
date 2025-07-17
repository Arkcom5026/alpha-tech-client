// ✅ deliveryNoteStore.js
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useDeliveryNoteStore = create(
  devtools((set) => ({
    printablePayments: [],

    loadPrintablePaymentsAction: async () => {
      try {
        const res = await fetch('/api/payments/printable');
        const data = await res.json();
        set({ printablePayments: data });
      } catch (err) {
        console.error('❌ โหลด printablePayments ล้มเหลว:', err);
      }
    },
  }))
);

export default useDeliveryNoteStore;
