
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
    receiveSNAction: async ({ barcode, serialNumber, receiptItemId } = {}) => {
      const code = barcode || serialNumber;
      if (!code) {
        set((s) => ({
          scannedList: [
            ...s.scannedList,
            { barcode: '', status: 'error', error: 'กรุณาระบุบาร์โค้ด' },
          ],
        }));
        return;
      }

      // กันสแกนซ้ำภายในรอบนี้ (เฉพาะที่สำเร็จไปแล้ว)
      const already = get().scannedList.some((x) => x.barcode === String(code) && x.status === 'success');
      if (already) {
        set((s) => ({
          scannedList: [
            ...s.scannedList,
            { barcode: String(code), status: 'error', error: 'สแกนซ้ำในรอบนี้' },
          ],
        }));
        return;
      }

      set({ loading: true, error: null });
      try {
        const data = await receiveStockItem({ barcode: String(code), serialNumber, receiptItemId });
        const kind = data?.stockItem ? 'SN' : (data?.lot ? 'LOT' : undefined);
        const extra = kind === 'SN'
          ? { stockItemId: data?.stockItem?.id }
          : kind === 'LOT'
            ? { activated: true, receiptItemId: data?.lot?.receiptItemId, quantity: data?.lot?.quantity }
            : {};

        set((state) => ({
          scannedList: [
            ...state.scannedList,
            { barcode: String(code), kind, status: 'success', ...extra, data },
          ],
        }));
      } catch (error) {
        console.error('[receiveSNAction]', error);
        set((state) => ({
          scannedList: [
            ...state.scannedList,
            { barcode: String(code), status: 'error', error: error?.message || 'รับสินค้าไม่สำเร็จ' },
          ],
        }));
      } finally {
        set({ loading: false });
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

    // ลบรายการตาม barcode (เผื่อยิงผิด)
    removeScannedItem: (barcode) => set((s) => ({ scannedList: s.scannedList.filter((x) => x.barcode !== barcode) })),

    // ย้อนกลับ 1 รายการล่าสุดที่สแกน
    undoLastScan: () => set((s) => ({ scannedList: s.scannedList.slice(0, -1) })),
  }))
);

export default useStockItemStore;





