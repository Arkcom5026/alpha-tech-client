

// ✅ stockItemStore.js — จัดการสถานะสินค้าเข้าสต๊อก

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  addStockItem,
  getStockItemsByReceipt,
  getStockItemsByProduct,
  deleteStockItem,
  updateStockItemStatus,
  getStockItemsForBarcodePrint
} from '../api/stockItemApi';

const useStockItemStore = create(
  devtools((set, get) => ({
    stockItems: [],
    loading: false,
    error: null,

    // ✅ โหลดรายการ SN ของใบรับสินค้า
    loadStockItemsByReceiptAction: async (receiptId) => {
      try {
        set({ loading: true });
        const data = await getStockItemsByReceipt(receiptId);
        set({ stockItems: data, loading: false });
      } catch (error) {
        console.error('[loadStockItemsByReceiptAction]', error);
        set({ error: error.message, loading: false });
      }
    },

    // ✅ โหลดรายการ SN ที่พร้อมพิมพ์บาร์โค้ด
    loadStockItemsForBarcodePrintAction: async () => {
      try {
        set({ loading: true });
        const data = await getStockItemsForBarcodePrint();
        set({ stockItems: data, loading: false });
      } catch (error) {
        console.error('[loadStockItemsForBarcodePrintAction]', error);
        set({ error: error.message, loading: false });
      }
    },

    // ✅ เพิ่ม SN เข้าสต๊อก
    addStockItemAction: async (data) => {
      try {
        const newItem = await addStockItem(data);
        set({ stockItems: [...get().stockItems, newItem] });
        return newItem;
      } catch (error) {
        console.error('[addStockItemAction]', error);
        throw error;
      }
    },

    // ✅ ลบ SN ออกจากสต๊อก (ถ้ายังไม่ถูกขาย)
    deleteStockItemAction: async (id) => {
      try {
        await deleteStockItem(id);
        set({
          stockItems: get().stockItems.filter((item) => item.id !== id),
        });
      } catch (error) {
        console.error('[deleteStockItemAction]', error);
        throw error;
      }
    },
  }))
);

export default useStockItemStore;
