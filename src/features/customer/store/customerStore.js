// src/features/customer/store/customerStore.js

import { create } from 'zustand';
import {
  searchStoreCustomers,
  getCustomerByPhone,
  createCustomer,
  updateCustomerProfileOnline as updateCustomerProfileOnlineApi,
  updateCustomerProfilePos as updateCustomerProfilePosApi,
  getCustomerByName,
  getMyCustomerProfileOnline as getMyCustomerProfileOnlineApi,
  getMyCustomerProfilePos as getMyCustomerProfilePosApi,
} from '../api/customerApi';

const mutationBusyError = () => new Error('กำลังบันทึกข้อมูลลูกค้า กรุณารอสักครู่');

const useCustomerStore = create((set, get) => ({
  customer: null,
  isLoading: false,
  isMutating: false,
  error: null,
  searchedCustomers: [],
  isSearching: false,
  searchError: null,

  searchStoreCustomersAction: async (query) => {
    set({ isSearching: true, searchError: null });
    try {
      const payload = await searchStoreCustomers(query);
      const results = Array.isArray(payload?.results) ? payload.results : [];
      set({ searchedCustomers: results });
      return payload;
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'ไม่สามารถค้นหาลูกค้าได้';
      set({ searchedCustomers: [], searchError: message });
      throw err;
    } finally {
      set({ isSearching: false });
    }
  },

  searchCustomers: async (query) => {
    set({ isSearching: true, searchError: null });
    try {
      const data = await getCustomerByName(query);
      set({ searchedCustomers: data });
      return data;
    } catch (err) {
      set({ searchedCustomers: [], searchError: 'ไม่สามารถค้นหาลูกค้าได้' });
      throw err;
    } finally {
      set({ isSearching: false });
    }
  },

  clearSearchedCustomers: () => set({ searchedCustomers: [], searchError: null }),

  getCustomerByPhone: async (phone) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getCustomerByPhone(phone);
      set({ customer: data });
      return data;
    } catch (err) {
      set({ customer: null, error: 'ไม่พบลูกค้า' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  createCustomer: async (customerData) => {
    if (get().isMutating) throw mutationBusyError();
    set({ isLoading: true, isMutating: true, error: null });
    try {
      const newCustomer = await createCustomer(customerData);
      set({ customer: newCustomer });
      return newCustomer;
    } catch (err) {
      set({ error: 'เกิดข้อผิดพลาดในการสร้างลูกค้า' });
      throw err;
    } finally {
      set({ isLoading: false, isMutating: false });
    }
  },

  updateCustomerProfileOnlineAction: async (data) => {
    if (get().isMutating) throw mutationBusyError();
    set({ isLoading: true, isMutating: true, error: null });
    try {
      const updatedCustomer = await updateCustomerProfileOnlineApi(data);
      set({ customer: updatedCustomer });
      return updatedCustomer;
    } catch (err) {
      set({ error: 'เกิดข้อผิดพลาดในการอัปเดตลูกค้า (Online)' });
      throw err;
    } finally {
      set({ isLoading: false, isMutating: false });
    }
  },

  updateCustomerProfilePosAction: async (id, data) => {
    if (get().isMutating) throw mutationBusyError();
    set({ isLoading: true, isMutating: true, error: null });
    try {
      const safeId = Number(id);
      if (!Number.isFinite(safeId)) throw new Error('INVALID_CUSTOMER_ID');
      const updatedCustomer = await updateCustomerProfilePosApi(safeId, data);
      set({ customer: updatedCustomer });
      return updatedCustomer;
    } catch (err) {
      set({ error: 'เกิดข้อผิดพลาดในการอัปเดตลูกค้า (POS)' });
      throw err;
    } finally {
      set({ isLoading: false, isMutating: false });
    }
  },

  getMyCustomerProfileOnlineAction: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getMyCustomerProfileOnlineApi();
      set({ customer: data });
      return data;
    } catch (err) {
      set({ customer: null, error: 'โหลดข้อมูลลูกค้าไม่สำเร็จ (Online)' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  getMyCustomerProfilePosAction: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getMyCustomerProfilePosApi();
      set({ customer: data });
      return data;
    } catch (err) {
      set({ customer: null, error: 'โหลดข้อมูลลูกค้าไม่สำเร็จ (POS)' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  setCustomer: (customer) => set({ customer }),
  resetCustomer: () => set({ customer: null, error: null }),

  createCustomerAction: async (data) => useCustomerStore.getState().createCustomer(data),
  updateCustomerProfileAction: async (data, mode = 'online') => {
    if (mode === 'pos') {
      const { id, ...payload } = data || {};
      const safeId = Number(id);
      if (!Number.isFinite(safeId)) throw new Error('INVALID_CUSTOMER_ID');
      return useCustomerStore.getState().updateCustomerProfilePosAction(safeId, payload);
    }
    return useCustomerStore.getState().updateCustomerProfileOnlineAction(data);
  },
  getMyCustomerProfileOnline: async () => useCustomerStore.getState().getMyCustomerProfileOnlineAction(),
  getMyCustomerProfilePos: async () => useCustomerStore.getState().getMyCustomerProfilePosAction(),
}));

export default useCustomerStore;
