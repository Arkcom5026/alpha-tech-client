


// src/features/barcode/store/barcodeStore.js
import { create } from 'zustand';
import apiClient from '@/utils/apiClient';
import {
  getBarcodesByReceiptId,
  generateMissingBarcodes,
  reprintBarcodes,
  getReceiptsWithBarcodes,
  getReceiptsReadyToScan,
  getReceiptsReadyToScanSN,
  receiveStockItem,
  updateSerialNumber,
  markBarcodesAsPrinted,
} from '../api/barcodeApi';


// 🔧 ตัวช่วยให้ shape ของ barcodes สอดคล้องกันทุก endpoint
const normalizeBarcodeItem = (b) => {
  const stockItemId = b?.stockItem?.id ?? b?.stockItemId ?? null;
  const serialNumber = b?.stockItem?.serialNumber ?? b?.serialNumber ?? null;
  const kind = b?.kind ?? (stockItemId ? 'SN' : (b?.simpleLotId ? 'LOT' : undefined));
  const qtyLabelsSuggested = Number(b?.qtyLabelsSuggested ?? (kind === 'LOT' ? 1 : 1));
  const productName = b?.productName ?? b?.product?.name ?? b?.stockItem?.product?.name ?? undefined;
  const productSpec = b?.productSpec ?? b?.product?.spec ?? b?.stockItem?.product?.spec ?? undefined;
  return {
    ...b,
    id: b?.id ?? null,
    barcode: b?.barcode,
    printed: Boolean(b?.printed),
    kind,
    qtyLabelsSuggested,
    productName,
    productSpec,
    stockItemId,
    serialNumber,
    stockItem: b?.stockItem
      ? {
          ...b.stockItem,
          id: stockItemId,
          serialNumber,
          barcode: b.stockItem.barcode ?? undefined,
          status: b.stockItem.status ?? undefined,
        }
      : {
          id: stockItemId,
          serialNumber,
          barcode: undefined,
          status: undefined,
        },
  };
};

const useBarcodeStore = create((set, get) => ({
  // Convenience getter for printing: duplicates LOT labels using qtyLabelsSuggested
  getExpandedBarcodesForPrint: (useSuggested = true) => {
    const state = get();
    const src = Array.isArray(state.barcodes) ? state.barcodes : [];
    const out = [];
    for (const b of src) {
      const n = useSuggested && b?.kind === 'LOT' ? Math.max(1, Number(b.qtyLabelsSuggested || 1)) : 1;
      for (let i = 0; i < n; i++) out.push({ ...b, _dupIdx: i });
    }
    return out;
  },

  barcodes: [],
  scannedList: [],
  receipts: [],
  currentReceipt: null,
  loading: false,
  error: null,

  // ----- Local-first draft scanning (persist per receipt) -----
  receiptId: null,
  draftScans: [], // [{ barcode, sn }]
  rowErrors: {}, // { [barcode]: { code, message } }
  draftLoading: false,  // ✅ NEW: error ต่อแถว

  // ✅ โหลดบาร์โค้ดตาม receiptId
  loadBarcodesAction: async (receiptId) => {
    set({ loading: true, error: null });
    try {
      const res = await getBarcodesByReceiptId(receiptId);
      set({
        barcodes: (res.barcodes || []).map(normalizeBarcodeItem),
        loading: false,
      });
    } catch (err) {
      console.error('[loadBarcodesAction]', err);
      set({ error: err.message || 'โหลดบาร์โค้ดล้มเหลว', loading: false });
    }
  },

  // ✅ Commit draftScans ทั้งหมดไป BE (ลบชุดซ้ำออก ใช้เวอร์ชันล่างสุดแทน)


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

  // ✅ โหลดใบที่พร้อมยิง SN (เฉพาะ SN ค้างยิง)
  loadReceiptsReadyToScanSNAction: async () => {
    set({ loading: true, error: null });
    try {
      const rows = await getReceiptsReadyToScanSN();
      set({ receipts: Array.isArray(rows) ? rows : [], loading: false });
    } catch (err) {
      console.error('[loadReceiptsReadyToScanSNAction]', err);
      set({ error: err?.message || 'โหลดใบที่พร้อมยิง SN ล้มเหลว', loading: false });
    }
  },

  // ✅ โหลดใบที่พร้อมยิง/เปิดล็อต (รวม SN & LOT)
  loadReceiptsReadyToScanAction: async () => {
    set({ loading: true, error: null });
    try {
      const rows = await getReceiptsReadyToScan();
      set({ receipts: Array.isArray(rows) ? rows : [], loading: false });
    } catch (err) {
      console.error('[loadReceiptsReadyToScanAction]', err);
      set({ error: err?.message || 'โหลดใบที่พร้อมยิง/เปิดล็อตล้มเหลว', loading: false });
    }
  },

  // ✅ โหลดเฉพาะ SN ที่ยังไม่ยิงของใบนี้
  loadUnscannedSNByReceiptAction: async (receiptId) => {
    set({ loading: true, error: null });
    try {
      const data = await getBarcodesByReceiptId(receiptId, { kind: 'SN', onlyUnscanned: true });
      set({ barcodes: (data?.barcodes || []).map(normalizeBarcodeItem), loading: false });
    } catch (err) {
      console.error('[loadUnscannedSNByReceiptAction]', err);
      set({ error: err?.message || 'โหลด SN ที่ค้างยิงล้มเหลว', loading: false });
    }
  },

  // ✅ โหลดเฉพาะ LOT ที่ยังไม่ ACTIVATE ของใบนี้
  loadUnactivatedLOTByReceiptAction: async (receiptId) => {
    set({ loading: true, error: null });
    try {
      const data = await getBarcodesByReceiptId(receiptId, { kind: 'LOT', onlyUnactivated: true });
      set({ barcodes: (data?.barcodes || []).map(normalizeBarcodeItem), loading: false });
    } catch (err) {
      console.error('[loadUnactivatedLOTByReceiptAction]', err);
      set({ error: err?.message || 'โหลด LOT ที่ยังไม่เปิดล็อตล้มเหลว', loading: false });
    }
  },

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

  updateSerialNumberAction: async (barcode, serialNumber) => {
    try {
      const res = await updateSerialNumber(barcode, serialNumber);
      const receiptId = res?.stockItem?.purchaseOrderReceiptItem?.receiptId;
      set((state) => ({
        barcodes: state.barcodes.map((item) =>
          item.barcode === barcode
            ? {
                ...item,
                serialNumber,
                stockItemId: item.stockItemId ?? res?.stockItem?.id ?? item.stockItem?.id ?? null,
                stockItem: {
                  ...(item.stockItem || {}),
                  serialNumber,
                  id: item.stockItem?.id ?? res?.stockItem?.id ?? null,
                },
              }
            : item
        ),
      }));
      if (receiptId) await get().loadBarcodesAction(receiptId);
      return res;
    } catch (err) {
      console.error('❌ อัปเดต SN ล้มเหลว:', err);
      throw err;
    }
  },

  deleteSerialNumberAction: async (barcode) => {
    try {
      const res = await updateSerialNumber(barcode, null);
      set((state) => ({
        barcodes: state.barcodes.map((item) =>
          item.barcode === barcode
            ? { ...item, serialNumber: null, stockItem: item.stockItem ? { ...item.stockItem, serialNumber: null } : { id: null, serialNumber: null } }
            : item
        ),
      }));
      const receiptId = res?.stockItem?.purchaseOrderReceiptItem?.receiptId;
      if (receiptId) await get().loadBarcodesAction(receiptId);
      return res;
    } catch (error) {
      console.error('❌ ลบ SN ล้มเหลว:', error);
      set({ error: error?.message || 'ลบ SN ล้มเหลว' });
      throw error;
    }
  },

  markBarcodeAsPrintedAction: async (purchaseOrderReceiptId) => {
    try {
      const updated = await markBarcodesAsPrinted(purchaseOrderReceiptId);
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

  searchReprintReceiptsAction: async ({ mode = 'RC', query, printed = true } = {}) => {
    const q = String(query ?? '').trim();
    if (!q) return [];
    try {
      const res = await apiClient.get('/barcodes/reprint-search', { params: { mode, query: q, printed } });
      return Array.isArray(res.data) ? res.data : res.data?.data ?? [];
    } catch (err) {
      console.warn('[searchReprintReceiptsAction] fallback', err?.response?.status);
      try {
        const res2 = await apiClient.get('/barcodes/with-barcodes', { params: { printed: true } });
        const rows = Array.isArray(res2.data) ? res2.data : [];
        const lower = q.toLowerCase();
        return mode === 'RC'
          ? rows.filter((r) => String(r.code || '').toLowerCase().includes(lower))
          : rows.filter((r) => String(r.purchaseOrderCode || r.orderCode || '').toLowerCase().includes(lower));
      } catch (fallbackErr) {
        console.error('[searchReprintReceiptsAction] ❌', fallbackErr);
        set({ error: fallbackErr?.message || 'ค้นหาใบรับเพื่อพิมพ์ซ้ำล้มเหลว' });
        throw fallbackErr;
      }
    }
  },
  // ----- Draft persistence helpers -----
  // Initialize local draft for a receipt (load from IndexedDB)
  // Clear draft (local only)
  // Add a local scan (idempotent by barcode)
  // Remove a local scan by barcode
  // Set/Update SN for a local scan row
  // Commit all local scans to backend (bulk)
  clearAll: () => set({
    barcodes: [],
    scannedList: [],
    receipts: [],
    currentReceipt: null,
    error: null,
  }),
}));

export default useBarcodeStore;

