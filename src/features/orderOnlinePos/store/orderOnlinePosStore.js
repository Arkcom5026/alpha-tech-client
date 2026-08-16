import { create } from 'zustand';
import {
  getOrderOnlinePosList,
  getOrderOnlinePosById,
  updateOrderOnlinePosStatus,
  approveOrderOnlineSlip,
  rejectOrderOnlineSlip,
  deleteOrderOnline,
  getOrderOnlineSummary,
} from '../api/orderOnlinePosApi';

const mutationBusyError = () => new Error('กำลังดำเนินการคำสั่งซื้ออยู่ กรุณารอสักครู่');

export const useOrderOnlinePosStore = create((set, get) => ({
  orderList: [],
  selectedOrder: null,
  summary: null,
  isLoading: false,
  mutationAction: null,
  error: null,

  loadOrderOnlinePosListAction: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getOrderOnlinePosList();
      set({ orderList: data, isLoading: false });
      return data;
    } catch (err) {
      set({ error: err.message || 'ไม่สามารถโหลดรายการได้', isLoading: false });
      throw err;
    }
  },

  loadOrderOnlinePosByIdAction: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getOrderOnlinePosById(id);
      set({ selectedOrder: data, isLoading: false });
      return data;
    } catch (err) {
      set({ error: err.message || 'ไม่สามารถโหลดคำสั่งซื้อได้', isLoading: false });
      throw err;
    }
  },

  loadOrderOnlineSummaryAction: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const summary = await getOrderOnlineSummary(id);
      set({ summary, isLoading: false });
      return summary;
    } catch (err) {
      set({ error: err.message || 'ไม่สามารถโหลดข้อมูลสรุปได้', isLoading: false });
      throw err;
    }
  },

  updateOrderOnlineStatusAction: async (id, status) => {
    if (get().mutationAction) throw mutationBusyError();
    const idSnapshot = Number(id);
    const statusSnapshot = status;
    set({ mutationAction: `status:${idSnapshot}`, isLoading: true, error: null });
    try {
      await updateOrderOnlinePosStatus(idSnapshot, statusSnapshot);
      return true;
    } catch (err) {
      set({ error: err.message || 'อัปเดตสถานะไม่สำเร็จ' });
      throw err;
    } finally {
      set({ mutationAction: null, isLoading: false });
    }
  },

  approveOrderOnlinePaymentSlipAction: async (id) => {
    if (get().mutationAction) throw mutationBusyError();
    const idSnapshot = Number(id);
    set({ mutationAction: `approve:${idSnapshot}`, isLoading: true, error: null });

    let result;
    try {
      result = await approveOrderOnlineSlip(idSnapshot);
    } catch (err) {
      set({ error: err.message || 'ไม่สามารถอนุมัติสลิปได้' });
      throw err;
    }

    let refreshError = null;
    try {
      const refreshed = await getOrderOnlinePosById(idSnapshot);
      set({ selectedOrder: refreshed });
    } catch (err) {
      refreshError = err;
      set({ error: err.message || 'อนุมัติสลิปสำเร็จแล้ว แต่รีเฟรชคำสั่งซื้อไม่สำเร็จ' });
    } finally {
      set({ mutationAction: null, isLoading: false });
    }

    return { result, refreshError };
  },

  rejectOrderOnlineSlipAction: async (id) => {
    if (get().mutationAction) throw mutationBusyError();
    const idSnapshot = Number(id);
    set({ mutationAction: `reject:${idSnapshot}`, isLoading: true, error: null });

    let result;
    try {
      result = await rejectOrderOnlineSlip(idSnapshot);
    } catch (err) {
      set({ error: err.message || 'ไม่สามารถปฏิเสธสลิปได้' });
      throw err;
    }

    let refreshError = null;
    try {
      const refreshed = await getOrderOnlinePosById(idSnapshot);
      set({ selectedOrder: refreshed });
    } catch (err) {
      refreshError = err;
      set({ error: err.message || 'ปฏิเสธสลิปสำเร็จแล้ว แต่รีเฟรชคำสั่งซื้อไม่สำเร็จ' });
    } finally {
      set({ mutationAction: null, isLoading: false });
    }

    return { result, refreshError };
  },

  deleteOrderOnlineAction: async (id) => {
    if (get().mutationAction) throw mutationBusyError();
    const idSnapshot = Number(id);
    set({ mutationAction: `delete:${idSnapshot}`, isLoading: true, error: null });

    try {
      await deleteOrderOnline(idSnapshot);
    } catch (err) {
      set({ error: err.message || 'ไม่สามารถลบคำสั่งซื้อได้' });
      throw err;
    }

    let refreshError = null;
    try {
      const refreshedList = await getOrderOnlinePosList();
      set({ orderList: refreshedList });
    } catch (err) {
      refreshError = err;
      set({ error: err.message || 'ลบคำสั่งซื้อสำเร็จแล้ว แต่รีเฟรชรายการไม่สำเร็จ' });
    } finally {
      set({ mutationAction: null, isLoading: false });
    }

    return { result: true, refreshError };
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
