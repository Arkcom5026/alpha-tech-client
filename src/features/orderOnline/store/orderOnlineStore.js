import { create } from 'zustand';
import { feedback } from '@/design-system/feedback';
import {
  getOrderOnlineList,
  getOrderOnlineListByCustomer,
  getOrderOnlineByIdForCustomer,
} from '../api/orderOnlineApi';

export const useOrderOnlineStore = create((set, get) => ({
  orders: [],
  selectedOrderOnline: null,
  isLoading: false,
  filterStatus: 'ALL',
  orderError: '',

  setFilterStatus: (status) => set({ filterStatus: status }),

  loadOrdersAction: async () => {
    try {
      set({ isLoading: true, orderError: '' });
      const status = get().filterStatus;
      const response = await getOrderOnlineList(status);
      set({ orders: response.data, orderError: '' });
      return response.data;
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'โหลดรายการคำสั่งซื้อไม่สำเร็จ';
      console.error('❌ loadOrdersAction error:', error);
      set({ orderError: message });
      feedback.error(message);
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  getAllOrderOnlineByIdAction: async () => {
    try {
      set({ isLoading: true, orderError: '' });
      const status = get().filterStatus;
      const response = await getOrderOnlineListByCustomer(status);
      set({ orders: response.data, orderError: '' });
      return response.data;
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'โหลดคำสั่งซื้อของลูกค้าไม่สำเร็จ';
      console.error('❌ getAllOrderOnlineByIdAction error:', error);
      set({ orderError: message });
      feedback.error(message);
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  loadOrderOnlineByIdForCustomerAction: async (id) => {
    try {
      set({ isLoading: true, orderError: '' });
      const response = await getOrderOnlineByIdForCustomer(id);
      set({ selectedOrderOnline: response.data, orderError: '' });
      return response.data;
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'โหลดรายละเอียดคำสั่งซื้อไม่สำเร็จ';
      console.error('❌ loadOrderOnlineByIdForCustomerAction error:', error);
      set({ orderError: message });
      feedback.error(message);
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  clearSelectedOrderOnline: () => set({ selectedOrderOnline: null, orderError: '' }),
}));
