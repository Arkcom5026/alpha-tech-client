// ✅ purchaseOrderReceiptStore.js — จัดการสถานะ Receipt + Items (ก่อนเข้าสต๊อก)

import { create } from 'zustand';
import {
  getAllReceipts,
  getReceiptById,
  getReceiptBarcodeSummaries,
  createReceipt,
  updateReceipt,
  deleteReceipt,
  getReceiptItemsByReceiptId
} from '@/features/purchaseOrderReceipt/api/purchaseOrderReceiptApi';
import { getEligiblePurchaseOrders, getPurchaseOrderDetailById } from '@/features/purchaseOrder/api/purchaseOrderApi';
import {
  addReceiptItem,
  updateReceiptItem,
  deleteReceiptItem
} from '@/features/purchaseOrderReceiptItem/api/purchaseOrderReceiptItemApi';

const usePurchaseOrderReceiptStore = create((set, get) => ({
  receipts: [],
  receiptBarcodeSummaries: [],
  purchaseOrdersForReceipt: [],
  currentReceipt: null,
  currentOrder: null,
  poItems: [],
  receiptItems: [], // ✅ เก็บรายการสินค้าของ receipt โดยเฉพาะ
  loading: false,
  receiptBarcodeLoading: false,
  error: null,

  loadReceipts: async () => {
    try {
      set({ loading: true });
      const data = await getAllReceipts();
      set({ receipts: data, loading: false });
    } catch (error) {
      console.error('📛 loadReceipts error:', error);
      set({ error, loading: false });
    }
  },

  loadReceiptById: async (id) => {
    try {
      set({ loading: true });
      const data = await getReceiptById(id);
      set({ currentReceipt: data, loading: false });
      return data; // ✅ return ค่าที่โหลด เพื่อให้ Component ใช้งานต่อได้
    } catch (error) {
      console.error('📛 loadReceiptById error:', error);
      set({ error, loading: false });
      return null;
    }
  },

  loadReceiptItemsByReceiptId: async (receiptId) => {
    try {
      const items = await getReceiptItemsByReceiptId(receiptId);
      set({ receiptItems: items });
      return items;
    } catch (error) {
      console.error('📛 loadReceiptItemsByReceiptId error:', error);
      set({ error });
      return [];
    }
  },

  loadReceiptBarcodeSummariesAction: async () => {
    try {
      set({ receiptBarcodeLoading: true });
      const data = await getReceiptBarcodeSummaries();
      set({ receiptBarcodeSummaries: data, receiptBarcodeLoading: false });
    } catch (error) {
      console.error('📛 loadReceiptBarcodeSummariesAction error:', error);
      set({ error, receiptBarcodeLoading: false });
    }
  },

  createReceiptAction: async (payload) => {
    try {
      const newReceipt = await createReceipt(payload);
      set((state) => ({ receipts: [newReceipt, ...state.receipts] }));
      return newReceipt;
    } catch (error) {
      console.error('📛 createReceipt error:', error);
      set({ error });
      throw error;
    }
  },

  updateReceipt: async (id, payload) => {
    try {
      const updated = await updateReceipt(id, payload);
      set((state) => ({
        receipts: state.receipts.map((r) => (r.id === id ? updated : r)),
        currentReceipt: updated,
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
      await deleteReceipt(id);
      set((state) => ({
        receipts: state.receipts.filter((r) => r.id !== id),
        currentReceipt: state.currentReceipt?.id === id ? null : state.currentReceipt,
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
      const added = await addReceiptItem(payload);
      return added;
    } catch (error) {
      console.error('📛 addReceiptItem error:', error);
      set({ error });
      throw error;
    }
  },

  updateReceiptItemAction: async (payload) => {
    try {
      const updated = await updateReceiptItem(payload);
      return updated;
    } catch (error) {
      console.error('📛 updateReceiptItem error:', error);
      set({ error });
      throw error;
    }
  },

  deleteReceiptItemAction: async (id) => {
    try {
      await deleteReceiptItem(id);
    } catch (error) {
      console.error('📛 deleteReceiptItem error:', error);
      set({ error });
      throw error;
    }
  },

  clearCurrentReceipt: () => set({ currentReceipt: null }),
}));

export default usePurchaseOrderReceiptStore;
