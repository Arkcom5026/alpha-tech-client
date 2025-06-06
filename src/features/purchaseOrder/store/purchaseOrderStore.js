// ✅ import product loader
import { create } from 'zustand';
import { getProducts } from '@/features/product/api/productApi';
import {
  createPurchaseOrder,
  deletePurchaseOrder,
  getEligiblePurchaseOrders,
  getPurchaseOrderById,
  getPurchaseOrders,
  updatePurchaseOrder,
  updatePurchaseOrderStatus
} from '../api/purchaseOrderApi';

const usePurchaseOrderStore = create((set) => ({
  purchaseOrders: [],
  selectedPO: null,
  productList: [],
  eligiblePOs: [],
  loading: false,
  error: null,

  // ✅ อัปเดตใหม่: รองรับ search และ status filter
  fetchAllPurchaseOrders: async ({ search = '', status = 'pending,partial', branchId }) => {
    set({ loading: true });
    try {
      const data = await getPurchaseOrders({ search, status, branchId });
      set({ purchaseOrders: data, loading: false });
    } catch (err) {
      console.error('❌ fetchAllPurchaseOrders error:', err);
      set({ error: err, loading: false });
    }
  },

  fetchEligiblePurchaseOrders: async (branchId) => {
    set({ loading: true });
    try {
      const data = await getEligiblePurchaseOrders(branchId);
      set({ eligiblePOs: data, loading: false });
    } catch (err) {
      console.error('❌ fetchEligiblePurchaseOrders error:', err);
      set({ error: err, loading: false });
    }
  },

  fetchPurchaseOrderById: async (id) => {
    set({ loading: true });
    try {
      const data = await getPurchaseOrderById(id);
      set({ selectedPO: data, loading: false });
      return data;
    } catch (err) {
      console.error('❌ fetchPurchaseOrderById error:', err);
      set({ error: err, loading: false });
    }
  },

  loadOrderById: async (id) => {
    try {
      const data = await getPurchaseOrderById(id);
      set({ selectedPO: data });
      return data;
    } catch (err) {
      console.error('❌ loadOrderById error:', err);
      throw err;
    }
  },

  createPurchaseOrder: async (poData) => {
    try {
      const newPO = await createPurchaseOrder(poData);
      set((state) => ({ purchaseOrders: [newPO, ...state.purchaseOrders] }));
      return newPO;
    } catch (err) {
      console.error('❌ createPurchaseOrder error:', err);
      throw err;
    }
  },

  updatePurchaseOrder: async (id, poData) => {
    try {
      const updated = await updatePurchaseOrder(id, poData);
      set((state) => ({
        purchaseOrders: state.purchaseOrders.map((po) =>
          po.id === id ? updated : po
        ),
        selectedPO: updated,
      }));
      return updated;
    } catch (err) {
      console.error('❌ updatePurchaseOrder error:', err);
      throw err;
    }
  },

  updatePurchaseOrderStatusAction: async ({ id, status }) => {
    try {
      const updated = await updatePurchaseOrderStatus({ id, status });
      set((state) => ({
        purchaseOrders: state.purchaseOrders.map((po) =>
          po.id === id ? updated : po
        ),
        selectedPO: state.selectedPO?.id === id ? updated : state.selectedPO,
      }));
      return updated;
    } catch (err) {
      console.error('❌ updatePurchaseOrderStatusAction error:', err);
      throw err;
    }
  },

  removePurchaseOrder: async (id) => {
    try {
      await deletePurchaseOrder(id);
      set((state) => ({
        purchaseOrders: state.purchaseOrders.filter((po) => po.id !== id),
      }));
    } catch (err) {
      console.error('❌ removePurchaseOrder error:', err);
      throw err;
    }
  },

  // ✅ โหลดสินค้า (ใช้ใน modal หรือ form ที่เกี่ยวข้องกับ PO)
  loadProductsPurchaseOrder: async ({ search, status, limit = 50, page = 1 } = {}) => {
    try {
      const data = await getProducts({ search, status, limit, page });
      set({ productList: data });
    } catch (err) {
      console.error('❌ loadProductsPurchaseOrder error:', err);
      set({ error: err });
    }
  },
}));

export default usePurchaseOrderStore;
