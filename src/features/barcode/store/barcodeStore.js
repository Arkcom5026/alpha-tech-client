











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

// ✅ Receipt finalization (must be called via Store; components must not call API directly)
import { finalizeReceiptIfNeeded } from '@/features/purchaseOrderReceipt/api/purchaseOrderReceiptApi';


// 🔧 ตัวช่วยให้ shape ของ barcodes สอดคล้องกันทุก endpoint
const normalizeBarcodeItem = (b) => {
  const stockItemId = b?.stockItem?.id ?? b?.stockItemId ?? null;
  // ✅ status source of truth: prefer nested stockItem.status from DB, fallback to flat stockItemStatus
  const stockItemStatus = b?.stockItem?.status ?? b?.stockItemStatus ?? null;
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
    stockItemStatus: stockItemStatus ? String(stockItemStatus).toUpperCase() : null,
    stockItem: b?.stockItem
      ? {
          ...b.stockItem,
          id: stockItemId,
          serialNumber,
          barcode: b.stockItem.barcode ?? undefined,
          status: b.stockItem.status ?? stockItemStatus ?? undefined,
        }
      : {
          id: stockItemId,
          serialNumber,
          barcode: undefined,
          status: stockItemStatus ?? undefined,
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

  // ✅ Standard UI actions (no dialog)
  clearErrorAction: () => set({ error: null }),
  clearError: () => set({ error: null }),

  // ----- Local-first draft scanning (persist per receipt) -----
  receiptId: null,
  draftScans: [], // [{ barcode, sn }]
  rowErrors: {}, // { [barcode]: { code, message } }
  draftLoading: false,  // ✅ NEW: loading สำหรับ draft actions/commit

  // ✅ โหลดบาร์โค้ดตาม receiptId (อัปเดต state สำหรับหน้า Preview/Scan)
  loadBarcodesAction: async (receiptId) => {
    set({ loading: true, error: null });
    try {
      const res = await getBarcodesByReceiptId(receiptId);
      set({
        barcodes: (res?.barcodes || []).map(normalizeBarcodeItem),
        loading: false,
      });
    } catch (err) {
      console.error('[loadBarcodesAction]', err);
      set({ error: err?.message || 'โหลดบาร์โค้ดล้มเหลว', loading: false });
    }
  },

  // ✅ สำหรับ Multi-print (Batch): คืนค่า list โดยไม่แตะ state กลาง (ไม่ clobber ระหว่างหลาย receipt)
  fetchBarcodesByReceiptIdAction: async (receiptId, opts = {}) => {
    set({ loading: true, error: null });
    try {
      const res = await getBarcodesByReceiptId(receiptId, opts);
      const list = (res?.barcodes || []).map(normalizeBarcodeItem);
      set({ loading: false });
      return list;
    } catch (err) {
      console.error('[fetchBarcodesByReceiptIdAction]', err);
      set({ error: err?.message || 'โหลดบาร์โค้ดล้มเหลว', loading: false });
      return [];
    }
  },

  // ✅ Alias (กันชื่อ action ไม่ตรงในหน้า Batch)
  loadBarcodesByReceiptIdAction: async (receiptId, opts = {}) => get().fetchBarcodesByReceiptIdAction(receiptId, opts),
  getBarcodesByReceiptIdAction: async (receiptId, opts = {}) => get().fetchBarcodesByReceiptIdAction(receiptId, opts),

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

  // ✅ Finalize receipt safely (Store-first)
  finalizeReceiptIfNeededAction: async (receiptId) => {
    try {
      set({ error: null });
      if (!receiptId) throw new Error('Missing receiptId');
      const rid = Number.isFinite(Number(receiptId)) ? Number(receiptId) : receiptId;
      return await finalizeReceiptIfNeeded(rid);
    } catch (err) {
      console.error('[finalizeReceiptIfNeededAction]', err);
      set({ error: err?.response?.data?.message || err?.message || 'Finalize ไม่สำเร็จ' });
      throw err;
    }
  },

  receiveSNAction: async (payload) => {
    // ✅ Accept multiple payload styles (Minimal Disruption)
    // - receiveSNAction('BARCODE')
    // - receiveSNAction({ barcode: 'BARCODE' })
    // - receiveSNAction({ barcode: { barcode: 'BARCODE', serialNumber?: '...' } })
    const raw = typeof payload === 'object' && payload !== null ? payload.barcode : payload;
    const barcode = raw && typeof raw === 'object' ? raw.barcode : raw;
    if (!barcode) return;
    try {
      const res = await receiveStockItem(barcode);
      const nextStockItem = res?.stockItem || res;

      // ✅ update barcodes list with fresh stockItem/status from BE
      set((state) => ({
        barcodes: Array.isArray(state.barcodes)
          ? state.barcodes.map((b) =>
              b.barcode === barcode
                ? normalizeBarcodeItem({
                    ...b,
                    stockItem: nextStockItem,
                    stockItemStatus: nextStockItem?.status ?? b.stockItemStatus ?? b.stockItem?.status,
                  })
                : b
            )
          : state.barcodes,
        // ✅ keep scannedList as "barcode rows" (not raw stockItem) to avoid UI fallback bugs
        scannedList: (() => {
          const prev = Array.isArray(state.scannedList) ? state.scannedList : [];
          const row = normalizeBarcodeItem({ barcode, stockItem: nextStockItem, stockItemStatus: nextStockItem?.status });
          // ✅ de-dup by barcode (idempotent-friendly)
          const next = prev.filter((x) => x?.barcode !== barcode);
          next.push(row);
          return next;
        })(),
      }));

      return res;
    } catch (err) {
      console.error('[receiveSNAction]', err);
      const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'ยิงบาร์โค้ดล้มเหลว';
      set({ error: msg });
      throw err;
    }
  },

  updateSerialNumberAction: async (barcode, serialNumber) => {
    try {
      const res = await updateSerialNumber(barcode, serialNumber);
      const nextStockItem = res?.stockItem;
      const receiptId = nextStockItem?.purchaseOrderReceiptItem?.receiptId;

      set((state) => ({
        barcodes: state.barcodes.map((item) =>
          item.barcode === barcode
            ? normalizeBarcodeItem({
                ...item,
                serialNumber,
                stockItemId: item.stockItemId ?? nextStockItem?.id ?? item.stockItem?.id ?? null,
                stockItem: {
                  ...(item.stockItem || {}),
                  ...(nextStockItem || {}),
                  serialNumber,
                  id: item.stockItem?.id ?? nextStockItem?.id ?? null,
                  status: nextStockItem?.status ?? item.stockItem?.status ?? item.stockItemStatus,
                },
                stockItemStatus: nextStockItem?.status ?? item.stockItemStatus ?? item.stockItem?.status,
              })
            : item
        ),
      }));

      if (receiptId) await get().loadBarcodesAction(receiptId);
      return res;
    } catch (err) {
      console.error('❌ อัปเดต SN ล้มเหลว:', err);
      set({ error: err?.message || 'อัปเดต Serial Number ล้มเหลว' });
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
    } catch (err) {
      console.error('❌ ลบ SN ล้มเหลว:', err);
      set({ error: err?.message || 'ลบ SN ล้มเหลว' });
      throw err;
    }
  },

  markBarcodeAsPrintedAction: async (payload) => {
    try {
      // ✅ Accept both styles:
      // - markBarcodeAsPrintedAction(receiptId)
      // - markBarcodeAsPrintedAction({ purchaseOrderReceiptId: receiptId })
      const rid =
        typeof payload === 'object' && payload !== null
          ? payload.purchaseOrderReceiptId ?? payload.receiptId
          : payload;

      if (!rid) throw new Error('ไม่พบ purchaseOrderReceiptId');

      const updated = await markBarcodesAsPrinted(rid);

      // ✅ Update local state to reflect printed immediately (no dialog)
      set((state) => ({
        barcodes: Array.isArray(state.barcodes)
          ? state.barcodes.map((item) => ({ ...item, printed: true }))
          : state.barcodes,
      }));

      return updated;
    } catch (err) {
      console.error('❌ อัปเดต printed ล้มเหลว:', err);
      set({ error: err?.message || 'อัปเดตสถานะ printed ล้มเหลว' });
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










