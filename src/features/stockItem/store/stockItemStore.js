// ✅ stockItemStore.js — จัดการ SN ที่ยิงเข้าสต๊อก และค้นหา SN สำหรับขาย
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  markStockItemsAsSold,
  receiveStockItem,
  searchStockItem,
  getAvailableStockItemsByProduct
} from '../api/stockItemApi';

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

    // ✅ ฟังก์ชันอัปเดตสถานะสินค้าเป็นขายแล้ว
    updateStockItemsToSoldAction: async (stockItemIds) => {
      try {
        await markStockItemsAsSold(stockItemIds); // ✅ ส่ง array ไปอย่างถูกต้อง
      } catch (err) {
        console.error('❌ อัปเดต stockItem ล้มเหลว:', err);
        throw err;
      }
    },

    // ✅ ฟังก์ชันค้นหาสินค้าจาก barcode เพื่อใช้งานทั่วไป เช่น หน้าขาย / เคลม / ตัดสต๊อก
    searchStockItemAction: async (barcode) => {
      try {
        const item = await searchStockItem(barcode);
        console.log('🔍 ค้นหาสินค้าสำหรับขาย:', item);
        return item || null;
      } catch (err) {
        console.error('❌ ไม่พบสินค้า:', err);
        return null;
      }
    },

    // ✅ ฟังก์ชันโหลด stockItem ที่พร้อมขายตาม productId
    loadAvailableStockItemsAction: async (productId) => {
      try {
        const data = await getAvailableStockItemsByProduct(productId);
        return data;
      } catch (err) {
        console.error('❌ ดึง stockItem ที่พร้อมขายล้มเหลว:', err);
        return [];
      }
    },

    // ✅ ฟังก์ชันล้างรายการ SN ที่ยิงแล้ว (ถ้าต้องการใช้)
    clearScannedList: () => set({ scannedList: [] }),
  }))
);

export default useStockItemStore;
