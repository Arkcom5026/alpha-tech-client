import { create } from 'zustand';
import {
  getAllReceipts,
  getReceiptById,
  getReceiptBarcodeSummaries,
  createReceipt,
  updateReceipt,
  deleteReceipt
} from '@/features/purchaseOrderReceipt/api/purchaseOrderReceiptApi';
import { getEligiblePurchaseOrders, getPurchaseOrderDetailById } from '@/features/purchaseOrder/api/purchaseOrderApi';
import { addReceiptItem, updateReceiptItem } from '@/features/purchaseOrderReceiptItem/api/purchaseOrderReceiptItemApi';

const purchaseOrderReceiptItemStore = create((set, get) => ({
  receipts: [],
  receiptBarcodeSummaries: [],
  purchaseOrdersForReceipt: [], // ✅ เพิ่มให้ไม่ undefined
  currentReceipt: null,
  currentOrder: null,
  poItems: [], // ✅ เพิ่ม state สำหรับ PO Items
  loading: false,
  receiptBarcodeLoading: false, // ✅ เพิ่มสถานะแยกสำหรับ barcode
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
    } catch (error) {
      console.error('📛 loadReceiptById error:', error);
      set({ error, loading: false });
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



  clearCurrentReceipt: () => set({ currentReceipt: null }),
}));

export default purchaseOrderReceiptItemStore;
  
