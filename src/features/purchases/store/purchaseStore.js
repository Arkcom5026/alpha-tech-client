// ✅ purchaseOrderStore.js (Store สำหรับใบสั่งซื้อสินค้า PO)
import { create } from 'zustand';
import {
  getAllPurchaseOrders,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
} from '@/features/purchases/api/purchaseOrderApi';

const usePurchaseOrderStore = create((set) => ({
  purchaseOrders: [],
  poError: null,

  getPurchaseOrders: async (token, branchId) => {
    try {
      const res = await getAllPurchaseOrders(token, branchId);
      set({ purchaseOrders: res });
    } catch (err) {
      set({ poError: err.message });
    }
  },

  addPurchaseOrder: async (token, form) => {
    try {
      const newPO = await createPurchaseOrder(token, form);
      set((state) => ({ purchaseOrders: [...state.purchaseOrders, newPO] }));
    } catch (err) {
      set({ poError: err.message });
    }
  },

  updatePurchaseOrder: async (token, id, form) => {
    try {
      const updated = await updatePurchaseOrder(token, id, form);
      set((state) => ({
        purchaseOrders: state.purchaseOrders.map((po) => (po.id === id ? updated : po)),
      }));
    } catch (err) {
      set({ poError: err.message });
    }
  },

  removePurchaseOrder: async (token, id) => {
    try {
      await deletePurchaseOrder(token, id);
      set((state) => ({
        purchaseOrders: state.purchaseOrders.filter((po) => po.id !== id),
      }));
    } catch (err) {
      set({ poError: err.message });
    }
  },
}));

export default usePurchaseOrderStore;