// ✅ purchaseOrderReceiptStore.js — จัดการสถานะ Receipt + Items (ก่อนเข้าสต๊อก)

import { create } from 'zustand';
import {
  getAllReceipts,
  getReceiptById,
  getReceiptBarcodeSummaries,
  createReceipt,
  updateReceipt,
  deleteReceipt,
  getReceiptItemsByReceiptId,
  markReceiptAsCompleted,
  finalizeReceiptIfNeeded,
  markReceiptAsPrinted,
  getReceiptsReadyToPay // ✅ ใช้งานจริง
} from '@/features/purchaseOrderReceipt/api/purchaseOrderReceiptApi';
import { getEligiblePurchaseOrders, getPurchaseOrderDetailById, updatePurchaseOrderStatus } from '@/features/purchaseOrder/api/purchaseOrderApi';

import {
  addReceiptItem,
  updateReceiptItem,
  deleteReceiptItem
} from '@/features/purchaseOrderReceiptItem/api/purchaseOrderReceiptItemApi';

const usePurchaseOrderReceiptStore = create((set) => ({
  receipts: [],
  receiptBarcodeSummaries: [],
  purchaseOrdersForReceipt: [],
  receiptsReadyToPay: [], // ✅ เก็บใบรับสินค้าที่พร้อมชำระ
  currentReceipt: null,
  currentOrder: null,
  poItems: [],
  receiptItems: [], // ✅ เก็บรายการสินค้าของ receipt โดยเฉพาะ
  loading: false,
  receiptBarcodeLoading: false,
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

  loadReceiptsReadyToPayAction: async (filters = {}) => {
    try {
      const { supplierId, startDate, endDate } = filters;
      if (!supplierId || !startDate || !endDate) {
        console.warn('[⏸ SKIP LOAD] Missing required filters:', { supplierId, startDate, endDate });
        return;
      }
      set({ loading: true, error: null });
      console.log('[🔍 LOAD RECEIPTS READY TO PAY]', filters);
      const data = await getReceiptsReadyToPay(filters);
      console.log('[✅ RECEIPTS LOADED]', data);
      set({ receiptsReadyToPay: data, loading: false, error: null });
    } catch (error) {
      console.error('📛 loadReceiptsReadyToPayAction error:', error);
      set({ error, loading: false });
    }
  },

  loadReceiptById: async (id) => {
    try {
      set({ loading: true, error: null });
      const data = await getReceiptById(id);
      set({ currentReceipt: data, loading: false, error: null });
      return data;
    } catch (error) {
      console.error('📛 loadReceiptById error:', error);
      set({ error, loading: false });
      return null;
    }
  },

  loadReceiptItemsByReceiptId: async (receiptId) => {
    try {
      set({ error: null });
      const items = await getReceiptItemsByReceiptId(receiptId);
      set({ receiptItems: items, error: null });
      return items;
    } catch (error) {
      console.error('📛 loadReceiptItemsByReceiptId error:', error);
      set({ error });
      return [];
    }
  },

  loadReceiptBarcodeSummariesAction: async () => {
    try {
      set({ loading: true, receiptBarcodeLoading: true, error: null });
      const data = await getReceiptBarcodeSummaries();
      console.log('loadReceiptBarcodeSummariesAction ', data);
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
