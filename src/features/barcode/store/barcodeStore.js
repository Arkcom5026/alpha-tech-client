// src/features/barcode/store/barcodeStore.js
import { create } from 'zustand';
import { generateReceiptBarcodes } from '../generation';
import { loadReceiptBarcodes } from '../receipt-detail';
import { listReceiptsWithBarcodes } from '../receipt-listing';
import {
  listReceiptsReadyToScan,
  listReceiptsReadyToScanSn,
} from '../scan-listing';
import { updateBarcodeSerialNumber } from '../serial';
import {
  markReceiptBarcodesPrinted,
  reprintReceiptBarcodes,
  searchReceiptsForReprint,
} from '../print-reprint';
import { finalizeReceipt } from '@/features/purchaseOrderReceipt/finalization';
import { getReceipt } from '@/features/purchaseOrderReceipt/query';

const getBarcodesByReceiptId = async (receiptId, opts = {}) => {
  const result = await loadReceiptBarcodes({ receiptId, ...opts });
  return result?.sourceResponse ?? { barcodes: result?.barcodes ?? [] };
};

const generateMissingBarcodes = async (receiptId, options = {}) => {
  const result = await generateReceiptBarcodes({ receiptId, options });
  return result?.sourceResponse ?? { barcodes: result?.barcodes ?? [] };
};

const reprintBarcodes = async (receiptId) => {
  const result = await reprintReceiptBarcodes(receiptId);
  return result?.sourceResponse ?? { barcodes: result?.rows ?? [] };
};

const getReceiptsWithBarcodes = async (opts = {}) => {
  const result = await listReceiptsWithBarcodes(opts);
  return result?.sourceResponse ?? result?.receipts ?? [];
};

const getReceiptsReadyToScanSN = async () => {
  const result = await listReceiptsReadyToScanSn();
  return result?.sourceResponse ?? result?.receipts ?? [];
};

const getReceiptsReadyToScan = async () => {
  const result = await listReceiptsReadyToScan();
  return result?.sourceResponse ?? result?.receipts ?? [];
};

const updateSerialNumber = async (barcode, serialNumber) => {
  const result = await updateBarcodeSerialNumber({ barcode, serialNumber });
  return result?.sourceResponse ?? result;
};

const markBarcodesAsPrinted = async (purchaseOrderReceiptId) => {
  const result = await markReceiptBarcodesPrinted(purchaseOrderReceiptId);
  return result?.sourceResponse ?? result;
};

const searchReprintReceipts = async (opts = {}) => {
  const result = await searchReceiptsForReprint(opts);
  return Array.isArray(result?.receipts) ? result.receipts : [];
};

const normalizeBarcodeItem = (b) => {
  const finalStockItemId = b?.stockItem?.id ?? b?.stockItemId ?? null;
  const rawStatus = b?.stockItem?.status ?? b?.stockItemStatus ?? b?.status ?? 'IN_STOCK';
  let cleanStatus = String(rawStatus).toUpperCase().trim();

  if (cleanStatus === 'SOLD_OUT' || cleanStatus === 'SOLD') {
    cleanStatus = 'SOLD';
  } else {
    cleanStatus = 'IN_STOCK';
  }

  const serialNumber = b?.stockItem?.serialNumber ?? b?.serialNumber ?? null;
  const kind = b?.kind ?? (finalStockItemId ? 'SN' : (b?.simpleLotId ? 'LOT' : undefined));
  const qtyLabelsSuggested = Number(b?.qtyLabelsSuggested ?? 1);
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
    stockItemId: finalStockItemId,
    serialNumber,
    stockItemStatus: cleanStatus,
    stockItem: b?.stockItem
      ? {
          ...b.stockItem,
          id: finalStockItemId,
          serialNumber,
          barcode: b.stockItem.barcode ?? undefined,
          status: cleanStatus,
        }
      : {
          id: finalStockItemId,
          serialNumber,
          barcode: undefined,
          status: cleanStatus,
        },
  };
};

const runWithConcurrency = async (items, worker, limit = 3) => {
  const arr = Array.isArray(items) ? items : [];
  if (arr.length === 0) return [];

  const safeLimit = Math.max(1, Number(limit) || 1);
  const results = new Array(arr.length);
  let nextIndex = 0;

  const runners = new Array(Math.min(safeLimit, arr.length)).fill(null).map(async () => {
    while (nextIndex < arr.length) {
      const i = nextIndex++;
      try {
        results[i] = await worker(arr[i], i);
      } catch (err) {
        results[i] = { __error: true, error: err, item: arr[i] };
      }
    }
  });

  await Promise.all(runners);
  return results;
};

const useBarcodeStore = create((set, get) => ({
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

  clearErrorAction: () => set({ error: null }),
  clearError: () => set({ error: null }),

  receiptId: null,
  draftScans: [],
  rowErrors: {},
  draftLoading: false,

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

  fetchBarcodesByReceiptIdAction: async (receiptId, opts = {}) => {
    const silent = Boolean(opts?.silent);
    if (!silent) set({ loading: true, error: null });
    try {
      const res = await getBarcodesByReceiptId(receiptId, opts);
      const list = (res?.barcodes || []).map(normalizeBarcodeItem);
      if (!silent) set({ loading: false });
      return list;
    } catch (err) {
      console.error('[fetchBarcodesByReceiptIdAction]', err);
      if (!silent) set({ error: err?.message || 'โหลดบาร์โค้ดล้มเหลว', loading: false });
      return [];
    }
  },

  loadBarcodesByReceiptIdAction: async (receiptId, opts = {}) => get().fetchBarcodesByReceiptIdAction(receiptId, opts),
  getBarcodesByReceiptIdAction: async (receiptId, opts = {}) => get().fetchBarcodesByReceiptIdAction(receiptId, opts),

  fetchPrintBatchAction: async (receiptIds = [], opts = {}) => {
    const ids = Array.isArray(receiptIds) ? receiptIds.map((x) => Number(x)).filter((x) => Number.isFinite(x)) : [];
    const concurrency = Math.max(1, Number(opts?.concurrency || 3));

    set({ loading: true, error: null });

    try {
      await runWithConcurrency(
        ids,
        async (rid) => {
          await generateMissingBarcodes(rid);
          return true;
        },
        concurrency
      );

      const lists = await runWithConcurrency(
        ids,
        async (rid) => {
          const res = await getBarcodesByReceiptId(rid, { ...(opts || {}), silent: true });
          const list = (res?.barcodes || []).map(normalizeBarcodeItem);
          return list.map((it, idx) => ({ ...it, receiptId: rid, _dupIdx: it?._dupIdx ?? idx }));
        },
        concurrency
      );

      const flat = (lists || []).flatMap((x) => (Array.isArray(x) ? x : []));
      set({ loading: false });
      return flat;
    } catch (err) {
      console.error('[fetchPrintBatchAction]', err);
      set({ error: err?.message || 'โหลดบาร์โค้ดแบบหลายใบล้มเหลว', loading: false });
      return [];
    } finally {
      set({ loading: false });
    }
  },

  loadReceiptWithSupplierAction: async (receiptId) => {
    try {
      const data = await getReceipt(receiptId);
      set({ currentReceipt: data });
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

  finalizeReceiptIfNeededAction: async (receiptId) => {
    try {
      set({ error: null });
      if (!receiptId) throw new Error('Missing receiptId');
      const rid = Number.isFinite(Number(receiptId)) ? Number(receiptId) : receiptId;
      const result = await finalizeReceipt(rid);
      return result?.sourceResponse ?? result;
    } catch (err) {
      console.error('[finalizeReceiptIfNeededAction]', err);
      set({ error: err?.response?.data?.message || err?.message || 'Finalize ไม่สำเร็จ' });
      throw err;
    }
  },

  updateReceivedSNAction: async ({ stockItemId, serialNumber, barcodeReceiptId, receiptId } = {}) => {
    try {
      if (!serialNumber) throw new Error('serialNumber is required');

      const state = get();
      const target = (state.barcodes || []).find((b) => b?.id === barcodeReceiptId);

      if (!target?.barcode) {
        throw new Error('ไม่พบ barcode สำหรับรายการนี้');
      }

      const barcode = target.barcode;
      const res = await updateSerialNumber(barcode, serialNumber);
      const nextStockItem = res?.stockItem;

      set((state) => ({
        barcodes: (state.barcodes || []).map((item) =>
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

      if (receiptId) {
        await get().loadBarcodesAction(receiptId);
      }

      return res;
    } catch (err) {
      console.error('❌ updateReceivedSNAction ล้มเหลว:', err);
      set({ error: err?.message || 'อัปเดต SN ไม่สำเร็จ' });
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
      const rid =
        typeof payload === 'object' && payload !== null
          ? payload.purchaseOrderReceiptId ?? payload.receiptId
          : payload;

      if (!rid) throw new Error('ไม่พบ purchaseOrderReceiptId');

      const updated = await markBarcodesAsPrinted(rid);

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

  searchReprintReceiptsAction: async ({
    mode = 'RC',
    query,
    printed = true,
    supplierKeyword,
    limit = 50,
  } = {}) => {
    const q = String(query ?? '').trim();
    const sup = String(supplierKeyword ?? '').trim();

    if (!q && !sup) return [];

    const lim = (() => {
      const n = Number(limit);
      if (!Number.isFinite(n)) return 50;
      return Math.min(Math.max(Math.trunc(n), 1), 50);
    })();

    try {
      const rows = await searchReprintReceipts({
        mode,
        query: q,
        printed,
        supplierKeyword: sup,
        limit: lim,
      });
      return Array.isArray(rows) ? rows : [];
    } catch (err) {
      console.warn('[searchReprintReceiptsAction] fallback', err?.response?.status);
      try {
        const rows = await getReceiptsWithBarcodes({ printed: true });
        const list = Array.isArray(rows) ? rows : [];

        const lowerQ = q.toLowerCase();
        const lowerSup = sup.toLowerCase();

        const matchSupplier = (r) => {
          if (!lowerSup) return true;
          const name = String(r?.supplier || r?.supplierName || r?.purchaseOrderSupplier || '').toLowerCase();
          return name.includes(lowerSup);
        };

        const matchCode = (r) => {
          if (!lowerQ) return true;
          if (String(mode).toUpperCase() === 'PO') {
            return String(r?.purchaseOrderCode || r?.orderCode || r?.poCode || '').toLowerCase().includes(lowerQ);
          }
          return String(r?.code || r?.receiptCode || '').toLowerCase().includes(lowerQ);
        };

        return list.filter((r) => matchSupplier(r) && matchCode(r)).slice(0, lim);
      } catch (fallbackErr) {
        console.error('[searchReprintReceiptsAction] ❌', fallbackErr);
        set({ error: fallbackErr?.message || 'ค้นหาใบรับเพื่อพิมพ์ซ้ำล้มเหลว' });
        throw fallbackErr;
      }
    }
  },

  clearAll: () => set({
    barcodes: [],
    scannedList: [],
    receipts: [],
    currentReceipt: null,
    error: null,
  }),
}));

export default useBarcodeStore;
