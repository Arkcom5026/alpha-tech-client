// ✅ stockItemStore.js — จัดการ SN ที่ยิงเข้าสต๊อก
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { receiveStockItem } from '../api/stockItemApi';
import {
  getReceiptItemsByReceiptId,
  getReceiptItemsByReceiptIds
} from '@/features/purchaseOrderReceiptItem/api/purchaseOrderReceiptItemApi';

const useStockItemStore = create(
  devtools((set, get) => ({
    scannedList: [],
    receiptItems: [],
    loading: false,
    error: null,

    // ✅ ฟังก์ชันยิง SN เข้าสต๊อก
    receiveSNAction: async ({ barcode, receiptItemId }) => {
      set({ loading: true });

      try {
        const data = await receiveStockItem({ barcode, receiptItemId });
        set((state) => ({
          scannedList: [
            ...state.scannedList,
            { barcode, status: 'success', data },
          ],
          loading: false,
        }));
      } catch (error) {
        console.error('[receiveSNAction]', error);
        set((state) => ({
          scannedList: [
            ...state.scannedList,
            { barcode, status: 'error', error: error.message },
          ],
          loading: false,
        }));
      }
    },

    // ✅ โหลด receiptItems หลายใบพร้อมกัน
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

    // ✅ ฟังก์ชันล้างรายการ SN ที่ยิงแล้ว (ถ้าต้องการใช้)
    clearScannedList: () => set({ scannedList: [] }),
  }))
);

export default useStockItemStore;
