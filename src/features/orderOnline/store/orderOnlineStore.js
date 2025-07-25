import { create } from 'zustand';
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

  setFilterStatus: (status) => set({ filterStatus: status }),

  loadOrdersAction: async () => {
    try {
      set({ isLoading: true });
      const status = get().filterStatus;
      const response = await getOrderOnlineList(status);
      set({ orders: response.data });
    } catch (error) {
      console.error('❌ loadOrdersAction error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  getAllOrderOnlineByIdAction: async () => {
    try {
      set({ isLoading: true });
      const status = get().filterStatus;
      const response = await getOrderOnlineListByCustomer(status);
      set({ orders: response.data });
    } catch (error) {
      console.error('❌ getAllOrderOnlineByIdAction error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  loadOrderOnlineByIdForCustomerAction: async (id) => {
    try {
      set({ isLoading: true });
      const response = await getOrderOnlineByIdForCustomer(id);
      set({ selectedOrderOnline: response.data });
    } catch (error) {
      console.error('❌ loadOrderOnlineByIdForCustomerAction error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  clearSelectedOrderOnline: () => set({ selectedOrderOnline: null }),
}));
