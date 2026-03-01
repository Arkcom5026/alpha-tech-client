












// purchaseOrderStore.js (patched: action-suffix baseline + safer loading/error flow)
import { create } from 'zustand';
import { getProducts } from '@/features/product/api/productApi';
import {
  createPurchaseOrder,
  deletePurchaseOrder,
  getEligiblePurchaseOrders,
  getPurchaseOrderById,
  getPurchaseOrders,
  updatePurchaseOrder,
  updatePurchaseOrderStatus,
  getPurchaseOrdersBySupplier,
} from '../api/purchaseOrderApi';

// NOTE: Option A — FE ห้ามส่ง branchId ไป backend (BE ต้องอ่านจาก JWT/employee context เท่านั้น)

const mapErrorToMessage = (err) => {
  if (!err) return 'เกิดข้อผิดพลาด';
  const msg =
    err?.response?.data?.message ||
    err?.message ||
    'เกิดข้อผิดพลาด';
  return String(msg);
};

const usePurchaseOrderStore = create((set, get) => ({
  // --- State ---
  purchaseOrders: [],
  selectedPO: null,
  // 🔁 alias ของ selectedPO (กันฟอร์มเก่าพัง)
  purchaseOrder: null,

  productList: [],
  eligiblePOs: [],
  suppliers: [],

  loading: false,
  error: null,          // เก็บ error message สำหรับแสดงบนหน้า (ห้าม dialog alert)

  // --- Generic error helpers ---
  setErrorAction: (err) => set({ error: mapErrorToMessage(err) }),
  clearErrorAction: () => set({ error: null }),

  // =========================================================
  // ✅ Actions (Production baseline: end with Action)
  // =========================================================

  // ✅ List PO (รองรับ search + status)
  fetchAllPurchaseOrdersAction: async ({ search = '', status = 'pending,partially_received' } = {}) => {
    set({ loading: true, error: null });
    try {
      const data = await getPurchaseOrders({ search, status });
      set({ purchaseOrders: Array.isArray(data) ? data : [] });
      return data;
    } catch (err) {
      console.error('❌ fetchAllPurchaseOrdersAction error:', err);
      set({ error: mapErrorToMessage(err) });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  // 🧯 Backward compatibility (legacy name)
  fetchAllPurchaseOrders: async (args) => get().fetchAllPurchaseOrdersAction(args),

  fetchEligiblePurchaseOrdersAction: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getEligiblePurchaseOrders();
      set({ eligiblePOs: Array.isArray(data) ? data : [] });
      return data;
    } catch (err) {
      console.error('❌ fetchEligiblePurchaseOrdersAction error:', err);
      set({ error: mapErrorToMessage(err) });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  // 🧯 Backward compatibility
  fetchEligiblePurchaseOrders: async () => get().fetchEligiblePurchaseOrdersAction(),

  fetchPurchaseOrderByIdAction: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await getPurchaseOrderById(id);
      set({ selectedPO: data || null, purchaseOrder: data || null });
      return data;
    } catch (err) {
      console.error('❌ fetchPurchaseOrderByIdAction error:', err);
      set({ error: mapErrorToMessage(err) });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  // 🧯 Backward compatibility
  fetchPurchaseOrderById: async (id) => get().fetchPurchaseOrderByIdAction(id),

  loadOrderByIdAction: async (id) => {
    // เวอร์ชันไม่ set loading (ใช้ในบาง flow ที่ไม่อยากกระพริบ)
    try {
      const data = await getPurchaseOrderById(id);
      set({ selectedPO: data || null, purchaseOrder: data || null });
      return data;
    } catch (err) {
      console.error('❌ loadOrderByIdAction error:', err);
      set({ error: mapErrorToMessage(err) });
      throw err;
    }
  },

  // 🧯 Backward compatibility
  loadOrderById: async (id) => get().loadOrderByIdAction(id),

  createPurchaseOrderAction: async (poData) => {
    set({ error: null });
    try {
      const newPO = await createPurchaseOrder(poData);
      set((state) => ({ purchaseOrders: [newPO, ...state.purchaseOrders] }));
      return newPO;
    } catch (err) {
      console.error('❌ createPurchaseOrderAction error:', err);
      set({ error: mapErrorToMessage(err) });
      throw err;
    }
  },

  // 🧯 Backward compatibility
  createPurchaseOrder: async (poData) => get().createPurchaseOrderAction(poData),

  createPurchaseOrderWithAdvanceAction: async (poData) => {
    // ✅ Option A: Create PO ไม่รองรับ advancePaymentsUsed
    const hasAdvance = Array.isArray(poData?.advancePaymentsUsed) && poData.advancePaymentsUsed.length > 0;
    if (hasAdvance) {
      const err = new Error(
        'ขั้นสร้างใบสั่งซื้อ (PO) ไม่รองรับการใช้เงินล่วงหน้า (advancePaymentsUsed) — กรุณาสร้าง PO แบบปกติ และไปผูก/ตัดชำระเงินในขั้นตอนจ่ายเงิน Supplier ภายหลัง'
      );
      err.code = 'PO_ADVANCE_NOT_ALLOWED';
      set({ error: mapErrorToMessage(err) });
      throw err;
    }
    return get().createPurchaseOrderAction(poData);
  },

  // 🧯 Backward compatibility
  createPurchaseOrderWithAdvance: async (poData) => get().createPurchaseOrderWithAdvanceAction(poData),

  updatePurchaseOrderAction: async (id, poData) => {
    set({ error: null });
    try {
      const updated = await updatePurchaseOrder(id, poData);
      set((state) => ({
        purchaseOrders: state.purchaseOrders.map((po) => (po.id === id ? updated : po)),
        selectedPO: updated,
        purchaseOrder: updated,
      }));
      return updated;
    } catch (err) {
      console.error('❌ updatePurchaseOrderAction error:', err);
      set({ error: mapErrorToMessage(err) });
      throw err;
    }
  },

  // 🧯 Backward compatibility
  updatePurchaseOrder: async (id, poData) => get().updatePurchaseOrderAction(id, poData),

  updatePurchaseOrderStatusAction: async ({ id, status }) => {
    set({ error: null });
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
      set({ error: mapErrorToMessage(err) });
      throw err;
    }
  },

  removePurchaseOrderAction: async (id) => {
    set({ error: null });
    try {
      await deletePurchaseOrder(id);
      set((state) => ({
        purchaseOrders: state.purchaseOrders.filter((po) => po.id !== id),
        selectedPO: state.selectedPO?.id === id ? null : state.selectedPO,
        purchaseOrder: state.purchaseOrder?.id === id ? null : state.purchaseOrder,
      }));
      return true;
    } catch (err) {
      console.error('❌ removePurchaseOrderAction error:', err);
      set({ error: mapErrorToMessage(err) });
      throw err;
    }
  },

  // 🧯 Backward compatibility
  removePurchaseOrder: async (id) => get().removePurchaseOrderAction(id),

  // ✅ โหลดสินค้า (ใช้ใน modal/form ที่เกี่ยวข้องกับ PO)
  loadProductsPurchaseOrderAction: async ({ search, status, limit = 50, page = 1 } = {}) => {
    set({ error: null });
    try {
      const data = await getProducts({ search, status, limit, page });
      set({ productList: Array.isArray(data) ? data : [] });
      return data;
    } catch (err) {
      console.error('❌ loadProductsPurchaseOrderAction error:', err);
      set({ error: mapErrorToMessage(err) });
      return null;
    }
  },

  // 🧯 Backward compatibility
  loadProductsPurchaseOrder: async (args) => get().loadProductsPurchaseOrderAction(args),

  // ✅ ดึง PO ตาม supplierId (ใช้ใน SupplierPaymentTabs)
  fetchPurchaseOrdersBySupplierAction: async (supplierId) => {
    set({ loading: true, error: null });
    try {
      const data = await getPurchaseOrdersBySupplier(supplierId);
      const list = Array.isArray(data) ? data : [];
      // ✅ กรองเฉพาะ PO ที่ยังไม่จ่ายครบ
      const unpaidPOs = list.filter((po) => po.paymentStatus !== 'PAID' && po.paymentStatus !== 'CANCELLED');
      set({ purchaseOrders: unpaidPOs });
      return unpaidPOs;
    } catch (err) {
      console.error('❌ fetchPurchaseOrdersBySupplierAction error:', err);
      set({ error: mapErrorToMessage(err) });
      return null;
    } finally {
      set({ loading: false });
    }
  },
}));

export default usePurchaseOrderStore;

































