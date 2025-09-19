// ✅ purchaseOrderStore.js (updated to align with current Form usage + store naming standard)
import { create } from 'zustand';
import { getProducts } from '@/features/product/api/productApi';
import {
  createPurchaseOrder,
  createPurchaseOrderWithAdvance,
  deletePurchaseOrder,
  getEligiblePurchaseOrders,
  getPurchaseOrderById,
  getPurchaseOrders,
  updatePurchaseOrder,
  updatePurchaseOrderStatus,
  getPurchaseOrdersBySupplier,
} from '../api/purchaseOrderApi';

import { useBranchStore } from '@/features/branch/store/branchStore';

const usePurchaseOrderStore = create((set, get) => ({
  // --- State ---
  purchaseOrders: [],
  selectedPO: null,
  // 🔁 เพิ่มคีย์ที่ฟอร์มปัจจุบันใช้อยู่ เพื่อไม่ให้พัง (alias ของ selectedPO)
  purchaseOrder: null,

  productList: [],
  eligiblePOs: [],
  suppliers: [],
  loading: false,
  error: null,

  // --- Actions (คงชื่อเดิมเพื่อ backwards-compatibility และเพิ่ม Action-suffix ตามกฎข้อ 64) ---

  // ✅ อัปเดตใหม่: รองรับ search และ status filter
  fetchAllPurchaseOrders: async ({ search = '', status = 'pending,partially_received' } = {}) => {
    const branchId = useBranchStore.getState().selectedBranchId;
    if (!branchId) return;
    set({ loading: true });
    try {
      const data = await getPurchaseOrders({ search, status, branchId });
      set({ purchaseOrders: data, loading: false });
    } catch (err) {
      console.error('❌ fetchAllPurchaseOrders error:', err);
      set({ error: err, loading: false });
    }
  },
  fetchAllPurchaseOrdersAction: async (args) => get().fetchAllPurchaseOrders(args),

  fetchEligiblePurchaseOrders: async () => {
    const branchId = useBranchStore.getState().selectedBranchId;
    if (!branchId) return;
    set({ loading: true });
    try {
      const data = await getEligiblePurchaseOrders(branchId);
      set({ eligiblePOs: data, loading: false });
    } catch (err) {
      console.error('❌ fetchEligiblePurchaseOrders error:', err);
      set({ error: err, loading: false });
    }
  },
  fetchEligiblePurchaseOrdersAction: async () => get().fetchEligiblePurchaseOrders(),

  fetchPurchaseOrderById: async (id) => {
    set({ loading: true });
    try {
      const data = await getPurchaseOrderById(id);
      set({ selectedPO: data, purchaseOrder: data, loading: false });
      return data;
    } catch (err) {
      console.error('❌ fetchPurchaseOrderById error:', err);
      set({ error: err, loading: false });
    }
  },
  fetchPurchaseOrderByIdAction: async (id) => get().fetchPurchaseOrderById(id),

  loadOrderById: async (id) => {
    try {
      const data = await getPurchaseOrderById(id);
      set({ selectedPO: data, purchaseOrder: data });
      return data;
    } catch (err) {
      console.error('❌ loadOrderById error:', err);
      throw err;
    }
  },
  loadOrderByIdAction: async (id) => get().loadOrderById(id),

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
  createPurchaseOrderAction: async (poData) => get().createPurchaseOrder(poData),

  createPurchaseOrderWithAdvance: async (poData) => {
    try {
      const newPO = await createPurchaseOrderWithAdvance(poData);
      set((state) => ({ purchaseOrders: [newPO, ...state.purchaseOrders] }));
      return newPO;
    } catch (err) {
      console.error('❌ createPurchaseOrderWithAdvance error:', err);
      throw err;
    }
  },
  createPurchaseOrderWithAdvanceAction: async (poData) => get().createPurchaseOrderWithAdvance(poData),

  updatePurchaseOrder: async (id, poData) => {
    try {
      const updated = await updatePurchaseOrder(id, poData);
      set((state) => ({
        purchaseOrders: state.purchaseOrders.map((po) => (po.id === id ? updated : po)),
        selectedPO: updated,
        purchaseOrder: updated,
      }));
      return updated;
    } catch (err) {
      console.error('❌ updatePurchaseOrder error:', err);
      throw err;
    }
  },
  updatePurchaseOrderAction: async (id, poData) => get().updatePurchaseOrder(id, poData),

  updatePurchaseOrderStatusAction: async ({ id, status }) => {
    try {
      const updated = await updatePurchaseOrderStatus({ id, status });
      set((state) => ({
        purchaseOrders: state.purchaseOrders.map((po) => (po.id === id ? updated : po)),
        selectedPO: state.selectedPO?.id === id ? updated : state.selectedPO,
        purchaseOrder: state.purchaseOrder?.id === id ? updated : state.purchaseOrder,
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
        // ถ้าลบตัวที่กำลังเปิดอยู่ ให้เคลียร์ selection
        selectedPO: state.selectedPO?.id === id ? null : state.selectedPO,
        purchaseOrder: state.purchaseOrder?.id === id ? null : state.purchaseOrder,
      }));
    } catch (err) {
      console.error('❌ removePurchaseOrder error:', err);
      throw err;
    }
  },
  removePurchaseOrderAction: async (id) => get().removePurchaseOrder(id),

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
  loadProductsPurchaseOrderAction: async (args) => get().loadProductsPurchaseOrder(args),

  // ✅ ดึง PO ตาม supplierId (ใช้ใน SupplierPaymentTabs)
  fetchPurchaseOrdersBySupplierAction: async (supplierId) => {
    set({ loading: true });
    try {
      const data = await getPurchaseOrdersBySupplier(supplierId);
      // ✅ กรองเฉพาะ PO ที่ยังไม่จ่ายครบ
      const unpaidPOs = data.filter(
        (po) => po.paymentStatus !== 'PAID' && po.paymentStatus !== 'CANCELLED'
      );
      set({ purchaseOrders: unpaidPOs, loading: false });
    } catch (err) {
      console.error('❌ fetchPurchaseOrdersBySupplierAction error:', err);
      set({ error: err, loading: false });
    }
  },
}));

export default usePurchaseOrderStore;
