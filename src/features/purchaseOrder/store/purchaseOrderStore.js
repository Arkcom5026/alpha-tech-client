import { create } from 'zustand';
import {
  createPurchaseOrder as createPurchaseOrderRequest,
  getPurchaseOrderById,
  getPurchaseOrders,
  updatePurchaseOrder as updatePurchaseOrderRequest,
} from '../api/purchaseOrderApi';

const pickPurchaseOrderList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

export const usePurchaseOrderStore = create((set) => ({
  historyList: [],
  isLoading: false,
  error: null,
  purchaseOrder: null,

  fetchHistoryLegacy: async (apiCallback) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiCallback();
      set({ historyList: data, isLoading: false });
    } catch (err) {
      set({
        error: err.message || 'ระบบไม่สามารถเข้าถึงข้อมูลประวัติการจัดซื้อเดิมได้',
        isLoading: false,
      });
    }
  },

  fetchAllPurchaseOrdersAction: async () => {
    set({ isLoading: true, error: null });
    try {
      const payload = await getPurchaseOrders();
      set({ historyList: pickPurchaseOrderList(payload), isLoading: false });
    } catch (err) {
      set({
        error: err.message || 'กระบวนการเชื่อมต่อดึงประวัติจริงล้มเหลว',
        isLoading: false,
      });
    }
  },

  fetchPurchaseOrderById: async (id) => {
    set({ isLoading: true, error: null, purchaseOrder: null });
    try {
      const purchaseOrder = await getPurchaseOrderById(id);
      set({ purchaseOrder, isLoading: false });
      return purchaseOrder;
    } catch (err) {
      set({
        error: err.message || 'ไม่สามารถโหลดข้อมูลใบสั่งซื้อนี้ได้',
        isLoading: false,
      });
      throw err;
    }
  },

  createPurchaseOrder: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const created = await createPurchaseOrderRequest(payload);
      set({ isLoading: false });
      return created;
    } catch (err) {
      set({
        error: err.message || 'เกิดข้อผิดพลาดระหว่างส่งบันทึกใบสั่งซื้อ',
        isLoading: false,
      });
      throw err;
    }
  },

  updatePurchaseOrder: async (id, payload) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updatePurchaseOrderRequest(id, payload);
      set({ isLoading: false });
      return updated;
    } catch (err) {
      set({
        error: err.message || 'เกิดข้อผิดพลาดระหว่างอัปเดตใบสั่งซื้อ',
        isLoading: false,
      });
      throw err;
    }
  },

  clearPurchaseOrder: () => set({ purchaseOrder: null, error: null }),
}));
