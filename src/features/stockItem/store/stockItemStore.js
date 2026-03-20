



// ✅ stockItemStore.js — จัดการ SN ที่ยิงเข้าสต๊อก และค้นหา SN สำหรับขาย
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  markStockItemsAsSold,
  receiveStockItem,
  receiveAllPendingNoSN,
  searchStockItem,
  getAvailableStockItemsByProduct
} from '../api/stockItemApi';

const useStockItemStore = create(
  devtools((set, get) => ({
    scannedList: [],
    loading: false,
    error: null,

    // ✅ ฟังก์ชันยิง SN เข้าสต๊อก
    receiveSNAction: async ({ barcode, serialNumber, receiptItemId, keepSN } = {}) => {
      const normalizedBarcode = String(barcode || '').trim();
      const normalizedSerialNumber = String(serialNumber || '').trim();
      const shouldKeepSN = keepSN === true;
      const code = normalizedBarcode;

      if (!code) {
        set((s) => ({
          scannedList: [
            ...s.scannedList,
            { barcode: '', status: 'error', error: 'กรุณาระบุบาร์โค้ด' },
          ],
        }));
        return;
      }

      if (shouldKeepSN && !normalizedSerialNumber) {
        set((s) => ({
          scannedList: [
            ...s.scannedList,
            { barcode: String(code), status: 'error', error: 'กรุณาระบุ SN' },
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
        const payload = shouldKeepSN
          ? {
              barcode: String(code),
              serialNumber: normalizedSerialNumber,
              receiptItemId,
              keepSN: true,
            }
          : {
              barcode: String(code),
              receiptItemId,
              keepSN: false,
            };

        const data = await receiveStockItem(payload);
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

    // ✅ ฟังก์ชันลับ: รับสินค้าค้างรับทั้งหมดในครั้งเดียว
    // ปัจจุบัน backend รองรับ bulk receive ได้ทั้ง SIMPLE และ STRUCTURED
    receiveAllPendingNoSNAction: async ({ receiptId } = {}) => {
      const normalizedReceiptId = Number(receiptId);
      if (!Number.isFinite(normalizedReceiptId) || normalizedReceiptId <= 0) {
        const e = new Error('receiptId ไม่ถูกต้อง');
        set({ error: e.message });
        throw e;
      }

      set({ loading: true, error: null });
      try {
        const res = await receiveAllPendingNoSN({ receiptId: normalizedReceiptId });
        return res;
      } catch (err) {
        const message = err?.response?.data?.message || err?.message || 'รับสินค้าค้างรับทั้งหมดไม่สำเร็จ';
        set({ error: message });
        console.error('❌ receiveAllPendingNoSNAction ล้มเหลว:', err);
        throw err;
      } finally {
        set({ loading: false });
      }
    },

    // ✅ ฟังก์ชันอัปเดตสถานะสินค้าเป็นขายแล้ว
    // Production hardening:
    // - รองรับ backend 409: ขายไม่ได้/ขายซ้ำ/สถานะไม่ใช่ IN_STOCK
    // - เซ็ต error ใน store เพื่อให้ UI แสดงเป็น error block ได้
    updateStockItemsToSoldAction: async (stockItemIds = []) => {
      // validate input
      const ids = Array.isArray(stockItemIds)
        ? [...new Set(stockItemIds.map((x) => Number(x)).filter(Number.isFinite))]
        : [];

      if (ids.length === 0) {
        const e = new Error('ไม่มีรายการสินค้าที่ต้องอัปเดตเป็นขายแล้ว');
        set({ error: e.message });
        throw e;
      }

      set({ loading: true, error: null });
      try {
        const res = await markStockItemsAsSold(ids); // ✅ ส่ง array ไปอย่างถูกต้อง
        return res;
      } catch (err) {
        const status = err?.response?.status;
        const payload = err?.response?.data;

        // ✅ 409 = อัปเดตไม่ครบ/ขายซ้ำ/ไม่อยู่ในสาขา/ไม่ใช่ IN_STOCK
        if (status === 409) {
          const message = payload?.message || 'มีบางรายการไม่สามารถเปลี่ยนเป็นขายแล้วได้';
          set({ error: message });

          const mapped = new Error(message);
          mapped.name = 'StockItemNotSellableError';
          mapped.status = 409;
          mapped.code = payload?.code;
          mapped.details = payload;
          throw mapped;
        }

        // 400/401/500 ฯลฯ
        const message = payload?.message || err?.message || 'อัปเดตสถานะขายแล้วไม่สำเร็จ';
        set({ error: message });
        console.error('❌ อัปเดต stockItem ล้มเหลว:', err);
        throw err;
      } finally {
        set({ loading: false });
      }
    },

    // ✅ ฟังก์ชันค้นหาสินค้าจาก barcode เพื่อใช้งานทั่วไป เช่น หน้าขาย / เคลม / ตัดสต๊อก
    // - ถ้าพบว่า barcode มีอยู่แต่ "ไม่พร้อมขาย" (เช่น SOLD/CLAIMED/LOST) จะคืนค่า object แบบ notSellable ให้ UI แสดงข้อความได้ชัด
    searchStockItemAction: async (barcode) => {
      try {
        const item = await searchStockItem(barcode);
        console.log('🔍 ค้นหาสินค้าสำหรับขาย:', item);
        return item || null;
      } catch (err) {
        const statusCode = err?.response?.status;
        const payload = err?.response?.data;

        // ✅ แยกเคส: มีบาร์โค้ด แต่ไม่พร้อมขาย
        if (statusCode === 409) {
          return {
            notSellable: true,
            status: payload?.status,
            code: payload?.code,
            message: payload?.message || 'สินค้านี้ไม่พร้อมขาย',
          };
        }

        // 404 = ไม่พบจริง ๆ
        if (statusCode === 404) return null;

        console.error('❌ ค้นหา stockItem ล้มเหลว:', err);
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







