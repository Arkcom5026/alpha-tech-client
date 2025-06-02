// ✅ src/features/purchaseOrder/store/purchaseOrderStore.js

import { create } from 'zustand';
import {
  getPurchaseOrderById,
  updatePurchaseOrder,
  deletePurchaseOrder,
  createPurchaseOrder,
  getPurchaseOrders,
  getEligiblePurchaseOrders // ✅ ดึง PO ที่ยังตรวจรับไม่ครบ
} from '../api/purchaseOrderApi';

// ✅ import product loader
import { getProducts } from '@/features/product/api/productApi';

const usePurchaseOrderStore = create((set) => ({
  purchaseOrders: [],
  selectedPO: null,
  productList: [],
  eligiblePOs: [], // ✅ สำหรับใบสั่งซื้อที่ตรวจรับได้
  loading: false,
  error: null,

  fetchAllPurchaseOrders: async (branchId) => {
    set({ loading: true });
    try {
      const data = await getPurchaseOrders(branchId);
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
