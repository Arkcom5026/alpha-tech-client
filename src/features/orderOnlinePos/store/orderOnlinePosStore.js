import { create } from 'zustand';
import {
  getOrderOnlinePosList,
  getOrderOnlinePosById,
  updateOrderOnlinePosStatus,
  approveOrderOnlineSlip,
  rejectOrderOnlineSlip,
  deleteOrderOnline,
} from '../api/orderOnlinePosApi';

export const useOrderOnlinePosStore = create((set, get) => ({
  orderList: [],
  selectedOrder: null,
  isLoading: false,
  error: null,

  loadOrderOnlinePosListAction: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getOrderOnlinePosList();
      set({ orderList: data, isLoading: false });
    } catch (err) {
      set({ error: err.message || 'ไม่สามารถโหลดรายการได้', isLoading: false });
    }
  },

  loadOrderOnlinePosByIdAction: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getOrderOnlinePosById(id);
      set({ selectedOrder: data, isLoading: false });
    } catch (err) {
      set({ error: err.message || 'ไม่สามารถโหลดคำสั่งซื้อได้', isLoading: false });
    }
  },

  updateOrderOnlineStatusAction: async (id, status) => {
    set({ isLoading: true, error: null });
    try {
      await updateOrderOnlinePosStatus(id, status);
      set({ isLoading: false });
    } catch (err) {
      set({ error: err.message || 'อัปเดตสถานะไม่สำเร็จ', isLoading: false });
      throw err;
    }
  },

  approveOrderOnlinePaymentSlipAction: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await approveOrderOnlineSlip(id);
      await get().loadOrderOnlinePosByIdAction(id);
      set({ isLoading: false });
    } catch (err) {
      set({ error: err.message || 'ไม่สามารถอนุมัติสลิปได้', isLoading: false });
    }
  },

  rejectOrderOnlineSlipAction: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await rejectOrderOnlineSlip(id);
      await get().loadOrderOnlinePosByIdAction(id);
      set({ isLoading: false });
    } catch (err) {
      set({ error: err.message || 'ไม่สามารถปฏิเสธสลิปได้', isLoading: false });
    }
  },

  deleteOrderOnlineAction: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await deleteOrderOnline(id);
      await get().loadOrderOnlinePosListAction();
      set({ isLoading: false });
    } catch (err) {
      set({ error: err.message || 'ไม่สามารถลบคำสั่งซื้อได้', isLoading: false });
    }
  },

  getOrderOnlineTotalSummary: () => {
    const order = get().selectedOrder;
    if (!order || !Array.isArray(order.items) || order.items.length === 0) {
      return {
        subtotal: 0,
        vat: 0,
        total: 0,
      };
    }

    const subtotal = order.items.reduce((sum, item) => {
      const price = typeof item.unitPrice === 'number' ? item.unitPrice : 0;
      const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
      return sum + price * quantity;
    }, 0);

    const vat = +(subtotal * 0.07).toFixed(2);
    const total = +(subtotal + vat).toFixed(2);

    return { subtotal, vat, total };
  },
}));
