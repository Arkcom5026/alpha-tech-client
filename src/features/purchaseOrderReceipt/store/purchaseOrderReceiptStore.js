

// ✅ purchaseOrderReceiptStore.js — จัดการสถานะ Receipt + Items (รองรับ SIMPLE + STRUCTURED + QUICK)

import { create } from 'zustand';
import {
  getAllReceipts,
  getReceiptBarcodeSummaries,
  createReceipt,
  updateReceipt,
  deleteReceipt,
  markReceiptAsCompleted,
  finalizeReceiptIfNeeded,
  markReceiptAsPrinted,
  createQuickReceipt,
  generateReceiptBarcodes,
  printReceipt,
  commitReceipt,
  getReceiptById,
} from '@/features/purchaseOrderReceipt/api/purchaseOrderReceiptApi';
import { getEligiblePurchaseOrders, getPurchaseOrderDetailById, updatePurchaseOrderStatus } from '@/features/purchaseOrder/api/purchaseOrderApi';
import { addReceiptItem, updateReceiptItem, deleteReceiptItem } from '@/features/purchaseOrderReceiptItem/api/purchaseOrderReceiptItemApi';

const usePurchaseOrderReceiptStore = create((set) => ({

  receipts: [],
  receiptBarcodeSummaries: [],
  receiptSummaries: [], // ✅ เก็บ summary ของใบรับสินค้าโดยตรง
  purchaseOrdersForReceipt: [],
  receiptsReadyToPay: [],
  barcodePreview: [], // ✅ สำหรับ payload บาร์โค้ดที่ใช้พิมพ์
  currentReceipt: null,
  currentOrder: null,
  poItems: [],
  receiptItems: [],
  loading: false,
  receiptBarcodeLoading: false,
  receiptSummariesLoading: false,
  error: null,

  // ── โหลด/จัดการ Receipt เดิม ─────────────────────────────────────────────
  loadReceipts: async () => {
    try {
      set({ loading: true, error: null });
      const data = await getAllReceipts();
      set({ receipts: data, loading: false, error: null });
    } catch (error) {
      console.error('📛 loadReceipts error:', error);
      set({ error, loading: false });
    }
  },

  loadReceiptSummariesAction: async (opts = {}) => {
    try {
      const wantPrinted = opts.printed ?? undefined;
      set({ loading: true, receiptSummariesLoading: true, error: null });

      const all = await getAllReceipts();
      const list = Array.isArray(all)
        ? all
        : Array.isArray(all?.items)
          ? all.items
          : Array.isArray(all?.data)
            ? all.data
            : Array.isArray(all?.results)
              ? all.results
              : [];

      const normalized = list.map((r) => ({
        id: r.id,
        code: r.code || r.receiptCode || r.purchaseOrderReceiptCode || r.poReceiptCode,
        purchaseOrderCode: r.purchaseOrderCode || r.orderCode || r.poCode || r.purchaseOrder?.code,
        supplier: r.supplier || r.supplierName || r.supplier?.name,
        taxInvoiceNo: r.tax || r.taxInvoiceNo || r.taxInvoiceNumber || r.taxNumber,
        receivedAt: r.receivedAt || r.createdAt || r.date,
        totalItems: r.total || r.totalItems || r.itemsCount || r.receivedQty || 0,
        scannedCount: r.scanned || r.scannedCount || r.generatedCount || 0,
        printed: Boolean(r.printed ?? r.isPrinted ?? false),
      }));

      const filtered =
        typeof wantPrinted === 'boolean'
          ? normalized.filter((x) => x.printed === wantPrinted)
          : normalized;

      set({ receiptSummaries: filtered, loading: false, receiptSummariesLoading: false, error: null });
      return filtered;
    } catch (error) {
      console.error('📛 loadReceiptSummariesAction error:', error);
      set({ error, loading: false, receiptSummariesLoading: false });
      return [];
    }
  },

  loadReceiptBarcodeSummariesAction: async (opts = {}) => {
    try {
      set({ loading: true, receiptBarcodeLoading: true, error: null });
      const params = { printed: opts.printed ?? false };
      const data = await getReceiptBarcodeSummaries(params);
      set({ receiptBarcodeSummaries: data, loading: false, receiptBarcodeLoading: false, error: null });
      return data;
    } catch (error) {
      console.error('📛 loadReceiptBarcodeSummariesAction error:', error);
      set({ error, loading: false, receiptBarcodeLoading: false });
      return [];
    }
  },

  createReceiptAction: async (payload) => {
    try {
      set({ error: null });
      const newReceipt = await createReceipt(payload);
      set((state) => ({ receipts: [newReceipt, ...state.receipts], error: null }));
      return newReceipt;
    } catch (error) {
      console.error('📛 createReceipt error:', error);
      set({ error });
      throw error;
    }
  },

  updateReceipt: async (id, payload) => {
    try {
      set({ error: null });
      const updated = await updateReceipt(id, payload);
      set((state) => ({
        receipts: state.receipts.map((r) => (r.id === id ? updated : r)),
        currentReceipt: updated,
        error: null,
      }));
      return updated;
    } catch (error) {
      console.error('📛 updateReceipt error:', error);
      set({ error });
      throw error;
    }
  },

  deleteReceipt: async (id) => {
    try {
      set({ error: null });
      await deleteReceipt(id);
      set((state) => ({
        receipts: state.receipts.filter((r) => r.id !== id),
        currentReceipt: state.currentReceipt?.id === id ? null : state.currentReceipt,
        error: null,
      }));
    } catch (error) {
      console.error('📛 deleteReceipt error:', error);
      set({ error });
      throw error;
    }
  },

  fetchPurchaseOrdersForReceipt: async () => {
    try {
      const res = await getEligiblePurchaseOrders();
      set({ purchaseOrdersForReceipt: res });
    } catch (err) {
      console.error('❌ โหลด Purchase Orders สำหรับใบรับสินค้าไม่สำเร็จ:', err);
    }
  },

  loadOrderById: async (poId) => {
    try {
      const res = await getPurchaseOrderDetailById(poId);
      set({ currentOrder: res });
    } catch (err) {
      console.error('❌ โหลด loadOrderById สำหรับใบรับสินค้าไม่สำเร็จ:', err);
    }
  },

  addReceiptItemAction: async (payload) => {
    try {
      set({ error: null });

      // ✅ รองรับทั้งรูปแบบใหม่และของเดิม
      // - ใหม่: payload.purchaseOrderReceiptId
      // - เดิม: payload.receiptId
      const adaptedPayload = { ...payload };

      if (!adaptedPayload.purchaseOrderReceiptId && adaptedPayload.receiptId) {
        adaptedPayload.purchaseOrderReceiptId = adaptedPayload.receiptId;
      }
      delete adaptedPayload.receiptId;

      // ✅ กันพลาด: ต้องมี purchaseOrderReceiptId เสมอ
      if (!adaptedPayload.purchaseOrderReceiptId) {
        throw new Error('Missing purchaseOrderReceiptId for addReceiptItem');
      }

      return await addReceiptItem(adaptedPayload);
    } catch (error) {
      console.error('📛 addReceiptItem error:', error);
      set({ error });
      throw error;
    }
  },

  updateReceiptItemAction: async (payload) => {
    try {
      set({ error: null });
      return await updateReceiptItem(payload.id, payload);
    } catch (error) {
      console.error('📛 updateReceiptItem error:', error);
      set({ error });
      throw error;
    }
  },

  deleteReceiptItemAction: async (id) => {
    try {
      set({ error: null });
      await deleteReceiptItem(id);
    } catch (error) {
      console.error('📛 deleteReceiptItem error:', error);
      set({ error });
      throw error;
    }
  },

  markReceiptAsCompletedAction: async ({ receiptId }) => {
    try {
      set({ error: null });
      const res = await markReceiptAsCompleted(receiptId);
      set((state) => ({
        receipts: state.receipts.map((r) => (r.id === receiptId ? res : r)),
        currentReceipt: res,
        error: null,
      }));
      return res;
    } catch (err) {
      console.error('❌ markReceiptAsCompletedAction error:', err);
      set({ error: err });
      throw err;
    }
  },

  markReceiptAsPrintedAction: async (receiptId) => {
    try {
      set({ error: null });
      const res = await markReceiptAsPrinted(receiptId);
      set((state) => ({
        receipts: state.receipts.map((r) => (r.id === receiptId ? res : r)),
        currentReceipt: res,
        receiptBarcodeSummaries: state.receiptBarcodeSummaries.map((s) =>
          s.id === receiptId ? { ...s, printed: true } : s
        ),
        receiptSummaries: (state.receiptSummaries || []).map((s) =>
          s.id === receiptId ? { ...s, printed: true } : s
        ),
        error: null,
      }));
      return res;
    } catch (err) {
      console.error('❌ markReceiptAsPrintedAction error:', err);
      set({ error: err });
      throw err;
    }
  },

  finalizeReceiptIfNeededAction: async (receiptId) => {
    try {
      set({ error: null });
      const res = await finalizeReceiptIfNeeded(receiptId);
      return res;
    } catch (err) {
      console.error('❌ finalizeReceiptIfNeededAction error:', err);
      set({ error: err });
      throw err;
    }
  },

  updatePurchaseOrderStatusAction: async ({ id, status }) => {
    try {
      set({ error: null });
      const res = await updatePurchaseOrderStatus({ id, status });
      set({ currentOrder: res, error: null });
      return res;
    } catch (err) {
      console.error('❌ updatePurchaseOrderStatusAction error:', err);
      set({ error: err });
      return null;
    }
  },

  // ── QUICK + SIMPLE/STRUCTURED Actions ───────────────────────────────────────
  createQuickReceiptAction: async (payload) => {
    set({ loading: true, error: null });
    try {
      const res = await createQuickReceipt(payload);
      set({ currentReceipt: res?.data ?? res ?? null, loading: false });
      return res;
    } catch (err) {
      console.error('❌ createQuickReceiptAction error:', err);
      set({ error: err, loading: false });
      throw err;
    }
  },

  generateBarcodesAction: async (receiptId) => {
    set({ loading: true, error: null });
    try {
      const res = await generateReceiptBarcodes(receiptId);
      set({ loading: false });
      return res;
    } catch (err) {
      console.error('❌ generateBarcodesAction error:', err);
      set({ error: err, loading: false });
      throw err;
    }
  },

  printReceiptAction: async (receiptId, options = {}) => {
    set({ loading: true, error: null });
    try {
      const res = await printReceipt(receiptId, options);
      set({ barcodePreview: res?.barcodes ?? [], loading: false });
      return res;
    } catch (err) {
      console.error('❌ printReceiptAction error:', err);
      set({ error: err, loading: false });
      throw err;
    }
  },

  commitReceiptAction: async (receiptId) => {
    set({ loading: true, error: null });
    try {
      const res = await commitReceipt(receiptId);
      const detail = await getReceiptById(receiptId);
      set({ currentReceipt: detail?.data ?? detail ?? null, loading: false });
      return res;
    } catch (err) {
      console.error('❌ commitReceiptAction error:', err);
      set({ error: err, loading: false });
      throw err;
    }
  },

  getReceiptAction: async (receiptId) => {
    set({ loading: true, error: null });
    try {
      const detail = await getReceiptById(receiptId);
      set({ currentReceipt: detail?.data ?? detail ?? null, loading: false });
      return detail;
    } catch (err) {
      console.error('❌ getReceiptAction error:', err);
      set({ error: err, loading: false });
      return null;
    }
  },

  clearCurrentReceipt: () => set({ currentReceipt: null }),
  clearError: () => set({ error: null }),
}));

export default usePurchaseOrderReceiptStore;


