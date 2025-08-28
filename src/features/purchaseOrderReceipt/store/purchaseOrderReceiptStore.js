// ✅ purchaseOrderReceiptStore.js — จัดการสถานะ Receipt + Items (ก่อนเข้าสต๊อก)

import { create } from 'zustand';
import {
  getAllReceipts,
  getReceiptBarcodeSummaries,
  createReceipt,
  updateReceipt,
  deleteReceipt,
  markReceiptAsCompleted,
  finalizeReceiptIfNeeded,
  markReceiptAsPrinted
} from '@/features/purchaseOrderReceipt/api/purchaseOrderReceiptApi';
import { getEligiblePurchaseOrders, getPurchaseOrderDetailById, updatePurchaseOrderStatus } from '@/features/purchaseOrder/api/purchaseOrderApi';
import { addReceiptItem, updateReceiptItem, deleteReceiptItem } from '@/features/purchaseOrderReceiptItem/api/purchaseOrderReceiptItemApi';

const usePurchaseOrderReceiptStore = create((set) => ({
  receipts: [],
  receiptBarcodeSummaries: [],
  receiptSummaries: [], // ✅ เก็บ summary ของใบรับสินค้าโดยตรง
  purchaseOrdersForReceipt: [],
  receiptsReadyToPay: [],
  currentReceipt: null,
  currentOrder: null,
  poItems: [],
  receiptItems: [],
  loading: false,
  receiptBarcodeLoading: false,
  receiptSummariesLoading: false,
  error: null,

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

      const normalized = (all || []).map((r) => ({
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
      console.log('📦 [loadOrderById] >> >> >>  id:', poId);
      const res = await getPurchaseOrderDetailById(poId);
      set({ currentOrder: res });
    } catch (err) {
      console.error('❌ โหลด loadOrderById สำหรับใบรับสินค้าไม่สำเร็จ:', err);
    }
  },

  addReceiptItemAction: async (payload) => {
    try {
      set({ error: null });
      const adaptedPayload = {
        ...payload,
        purchaseOrderReceiptId: payload.receiptId,
      };
      delete adaptedPayload.receiptId;
      const added = await addReceiptItem(adaptedPayload);
      return added;
    } catch (error) {
      console.error('📛 addReceiptItem error:', error);
      set({ error });
      throw error;
    }
  },

  updateReceiptItemAction: async (payload) => {
    try {
      set({ error: null });
      const updated = await updateReceiptItem(payload.id, payload);
      return updated;
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
        // ✅ อัปเดตสรุปรายการให้สะท้อน printed=true
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
      console.log('✅ Finalized receipt if needed:', res);
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
      console.log('📦 อัปเดตสถานะใบสั่งซื้อสำเร็จ:', status);
      return res;
    } catch (err) {
      console.error('❌ updatePurchaseOrderStatusAction error:', err);
      set({ error: err });
      return null;
    }
  },

  clearCurrentReceipt: () => set({ currentReceipt: null }),

  clearError: () => set({ error: null })
}));

export default usePurchaseOrderReceiptStore;


