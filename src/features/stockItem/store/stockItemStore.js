// ✅ stockItemStore.js — จัดการ SN ที่ยิงเข้าสต๊อก
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { markStockItemsAsSold, receiveStockItem } from '../api/stockItemApi';

const useStockItemStore = create(
  devtools((set, get) => ({
    scannedList: [],
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


    updateStockItemsToSoldAction: async (saleId) => {
      try {
        await markStockItemsAsSold(saleId);
      } catch (err) {
        console.error('❌ อัปเดต stockItem ล้มเหลว:', err);
      }
    },


    // ✅ ฟังก์ชันล้างรายการ SN ที่ยิงแล้ว (ถ้าต้องการใช้)
    clearScannedList: () => set({ scannedList: [] }),
  }))
);

export default useStockItemStore;