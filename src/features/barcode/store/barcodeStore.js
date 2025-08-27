// src/features/barcode/store/barcodeStore.js
import apiClient from '@/utils/apiClient';
import { create } from 'zustand';
import {
  generateMissingBarcodes,
  getBarcodesByReceiptId,
  getReceiptsWithBarcodes,
  markBarcodesAsPrinted,
  receiveStockItem,
  updateSerialNumber,
  reprintBarcodes, // ✅ NEW
} from '../api/barcodeApi';

// 🔧 ตัวช่วยให้ shape ของ barcodes สอดคล้องกันทุก endpoint
const normalizeBarcodeItem = (b) => ({
  id: b.id ?? null,
  barcode: b.barcode,
  printed: Boolean(b.printed),
  // ทำให้มีโหนด stockItem เสมอ เพื่อให้ UI อ้างถึงได้ตรงกัน
  stockItem: b.stockItem
    ? {
        id: b.stockItem.id ?? b.stockItemId ?? null,
        serialNumber: b.stockItem.serialNumber ?? b.serialNumber ?? null,
        barcode: b.stockItem.barcode ?? undefined,
        status: b.stockItem.status ?? undefined,
      }
    : {
        id: b.stockItemId ?? null,
        serialNumber: b.serialNumber ?? null,
        barcode: undefined,
        status: undefined,
      },
});

const useBarcodeStore = create((set, get) => ({
  barcodes: [],
  scannedList: [],
  receipts: [],
  currentReceipt: null,
  loading: false,
  error: null,

  // ✅ โหลดบาร์โค้ดตาม receiptId
  loadBarcodesAction: async (receiptId) => {
    set({ loading: true, error: null });
    try {
      const res = await getBarcodesByReceiptId(receiptId);
      set({
        barcodes: (res.barcodes || []).map(normalizeBarcodeItem),
        loading: false,
      });
      // console.log('res getBarcodesByReceiptId : ', res);
    } catch (err) {
      console.error('[loadBarcodesAction]', err);
      set({ error: err.message || 'โหลดบาร์โค้ดล้มเหลว', loading: false });
    }
  },

  // ✅ โหลดใบรับสินค้าพร้อม supplier
  loadReceiptWithSupplierAction: async (receiptId) => {
    try {
      const res = await apiClient.get(`/purchase-order-receipts/${receiptId}`);
      set({ currentReceipt: res.data });
    } catch (err) {
      console.error('[loadReceiptWithSupplierAction]', err);
      set({ error: 'โหลดข้อมูลใบรับสินค้าไม่สำเร็จ' });
    }
  },

  // ✅ สร้างบาร์โค้ดที่ยังไม่ถูกสร้าง (ครั้งแรก)
  generateBarcodesAction: async (receiptId) => {
    set({ loading: true, error: null });
    try {
      const res = await generateMissingBarcodes(receiptId);
      const list = (res.barcodes || []).map(normalizeBarcodeItem);
      set({ barcodes: list, loading: false });
      return list;
    } catch (err) {
      console.error('[generateBarcodesAction]', err);
      set({ error: err.message || 'สร้างบาร์โค้ดล้มเหลว', loading: false });
      throw err;
    }
  },

  // ✅ พิมพ์ซ้ำ: ดึงบาร์โค้ดเดิมทั้งหมด (ไม่ generate ใหม่)
  reprintBarcodesAction: async (receiptId) => {
    set({ loading: true, error: null });
    try {
      const res = await reprintBarcodes(receiptId);
      const list = (res.barcodes || []).map(normalizeBarcodeItem);
      set({ barcodes: list, loading: false });
      return list;
    } catch (err) {
      console.error('[reprintBarcodesAction]', err);
      set({ error: err.message || 'พิมพ์ซ้ำล้มเหลว', loading: false });
      throw err;
    }
  },

  // ✅ โหลดใบตรวจรับที่มีการสร้างบาร์โค้ดแล้วเท่านั้น
  loadReceiptsWithBarcodesAction: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getReceiptsWithBarcodes();
      set({ receipts: data || [], loading: false });
    } catch (err) {
      console.error('[loadReceiptsWithBarcodesAction]', err);
      set({ error: err.message || 'โหลดใบตรวจรับล้มเหลว', loading: false });
    }
  },

  // ✅ ยิง SN → เพิ่ม StockItem → เก็บไว้ใน scannedList
  receiveSNAction: async (barcode) => {
    if (!barcode) return;
    try {
      const res = await receiveStockItem(barcode);
      set((state) => ({ scannedList: [...state.scannedList, res.stockItem] }));
    } catch (err) {
      console.error('[receiveSNAction]', err);
      set({ error: err.message || 'ยิงบาร์โค้ดล้มเหลว' });
    }
  },

  // ✅ อัปเดต/บันทึก SN
  updateSerialNumberAction: async (barcode, serialNumber) => {
    try {
      const res = await updateSerialNumber(barcode, serialNumber);
      const receiptId = res?.stockItem?.purchaseOrderReceiptItem?.receiptId;

      // อัปเดตใน Store ให้สอดคล้อง
      set((state) => ({
        barcodes: state.barcodes.map((item) =>
          item.barcode === barcode
            ? {
                ...item,
                stockItem: {
                  ...(item.stockItem || {}),
                  serialNumber,
                  id: item.stockItem?.id ?? res?.stockItem?.id ?? null,
                },
              }
            : item
        ),
      }));

      // ถ้ามี receiptId ให้รีโหลดเพื่อความแม่นยำ
      if (receiptId) {
        const { loadBarcodesAction } = get();
        await loadBarcodesAction(receiptId);
      }

      return res;
    } catch (err) {
      console.error('❌ อัปเดต SN ล้มเหลว:', err);
      throw err;
    }
  },

  // ✅ ลบ SN (set เป็น null)
  deleteSerialNumberAction: async (barcode) => {
    try {
      const res = await updateSerialNumber(barcode, null);
      set((state) => ({
        barcodes: state.barcodes.map((item) =>
          item.barcode === barcode
            ? {
                ...item,
                stockItem: item.stockItem
                  ? { ...item.stockItem, serialNumber: null }
                  : { id: null, serialNumber: null },
              }
            : item
        ),
      }));

      const receiptId = res?.stockItem?.purchaseOrderReceiptItem?.receiptId;
      if (receiptId) {
        const { loadBarcodesAction } = get();
        await loadBarcodesAction(receiptId);
      }

      return res;
    } catch (error) {
      console.error('❌ ลบ SN ล้มเหลว:', error);
      set({ error: error?.message || 'ลบ SN ล้มเหลว' });
      throw error;
    }
  },

  // ✅ อัปเดตสถานะ printed: true ด้วย purchaseOrderReceiptId
  markBarcodeAsPrintedAction: async (purchaseOrderReceiptId) => {
    try {
      const updated = await markBarcodesAsPrinted(purchaseOrderReceiptId);
      // เนื่องจากรายการใน state ไม่มี field purchaseOrderReceiptId แน่นอน
      // จึงตีธง printed ให้กับรายการที่แสดงอยู่ทั้งหมดแทน (หรือจะ reload ก็ได้)
      set((state) => ({
        barcodes: state.barcodes.map((item) => ({ ...item, printed: true })),
      }));
      return updated;
    } catch (err) {
      console.error('❌ อัปเดต printed ล้มเหลว:', err);
      set({ error: 'อัปเดตสถานะ printed ล้มเหลว' });
      throw err;
    }
  },
  // ✅ ค้นหาใบรับสำหรับพิมพ์ซ้ำ (เรียก BE ทุกครั้ง)
  searchReprintReceiptsAction: async ({ mode = 'RC', query, printed = true } = {}) => {
    const q = String(query ?? '').trim();
    if (!q) return [];
    try {
      // พยายามเรียก endpoint เฉพาะการค้นหา (ถ้ามี)
      const res = await apiClient.get('/barcodes/reprint-search', { params: { mode, query: q, printed } });
      const rows = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      return rows;
    } catch (err) {
      console.warn('[searchReprintReceiptsAction] fallback to /barcodes/with-barcodes', err?.response?.status);
      // Fallback: ใช้ endpoint รายการรวม แล้วกรองฝั่ง client (ยังคงเรียก BE ทุกครั้ง)
      try {
        const res2 = await apiClient.get('/barcodes/with-barcodes', { params: { printed: true } });
        const rows = Array.isArray(res2.data) ? res2.data : [];
        const lower = q.toLowerCase();
        return (mode === 'RC'
          ? rows.filter((r) => String(r.code || '').toLowerCase().includes(lower))
          : rows.filter((r) => String(r.purchaseOrderCode || r.orderCode || '').toLowerCase().includes(lower))
        );
      } catch (fallbackErr) {
        console.error('[searchReprintReceiptsAction] ❌', fallbackErr);
        set({ error: fallbackErr?.message || 'ค้นหาใบรับเพื่อพิมพ์ซ้ำล้มเหลว' });
        throw fallbackErr;
      }
    }
  },

  // ✅ รีเซต
  clearAll: () =>
    set({
      barcodes: [],
      scannedList: [],
      receipts: [],
      currentReceipt: null,
      error: null,
    }),
}));

export default useBarcodeStore;

