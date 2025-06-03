// ✅ receiptItemStore.js — จัดการสถานะ ReceiptItem (ก่อนเข้าสต๊อก)

import { , getReceiptItemsByReceiptId, getReceiptItemsByReceiptIds } from '@/features/purchaseOrderReceiptItem/api/purchaseOrderReceiptItemApi';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const stockItemStore = create(
  devtools((set, get) => ({
    receiptItems: [],
    loading: false,
    error: null,

    // ✅ โหลด ReceiptItem จากใบเดียว
    loadReceiptById : async (receiptId) => {
      try {
        set({ loading: true });
        const data = await getReceiptItemsByReceiptId(receiptId);
        set({ receiptItems: data, loading: false });
      } catch (error) {
        console.error('[loadReceiptById ]', error);
        set({ error: error.message, loading: false });
      }
    },

    // ✅ โหลด ReceiptItem จากหลายใบ
    loadReceiptItemsByReceiptIdsAction: async (receiptIds) => {
      try {
        set({ loading: true });
        const data = await getReceiptItemsByReceiptIds(receiptIds);
        set({ receiptItems: data, loading: false });
      } catch (error) {
        console.error('[loadReceiptItemsByReceiptIdsAction]', error);
        set({ error: error.message, loading: false });
      }
    },
  }))
);

export default stockItemStore;
