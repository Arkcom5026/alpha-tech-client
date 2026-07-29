// src/features/customer/store/customerStore.js

import { create } from 'zustand';
import {
  searchCustomers as searchCustomersApi,
  getCustomerByPhone,
  createCustomer,
  updateCustomerProfileOnline as updateCustomerProfileOnlineApi,
  updateCustomerProfilePos as updateCustomerProfilePosApi,
  getMyCustomerProfileOnline as getMyCustomerProfileOnlineApi,
  getMyCustomerProfilePos as getMyCustomerProfilePosApi,
} from '../api/customerApi';

const useCustomerStore = create((set) => ({
  customer: null,
  isLoading: false,
  error: null,

  searchedCustomers: [],
  isSearching: false,
  searchError: null,

  // 🔎 Unified customer-only search for POS and other customer consumers
  searchCustomers: async (query) => {
    set({ isSearching: true, searchError: null });
    try {
      const data = await searchCustomersApi(query);
      const rows = Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data)
          ? data
          : data
            ? [data]
            : [];
      set({ searchedCustomers: rows });
      return rows;
    } catch (err) {
      set({ searchedCustomers: [], searchError: 'ไม่สามารถค้นหาลูกค้าได้' });
      throw err;
    } finally {
      set({ isSearching: false });
    }
  },

  clearSearchedCustomers: () => {
    set({ searchedCustomers: [], searchError: null });
  },

  // ☎️ Lookup by phone (legacy POS compatibility)
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

  // ➕ Create
  createCustomer: async (customerData) => {
    set({ isLoading: true, error: null });
    try {
      const newCustomer = await createCustomer(customerData);
      set({ customer: newCustomer });
      return newCustomer;
    } catch (err) {
      set({ error: 'เกิดข้อผิดพลาดในการสร้างลูกค้า' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // ✏️ Update (Online)
  updateCustomerProfileOnlineAction: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const updatedCustomer = await updateCustomerProfileOnlineApi(data);
      set({ customer: updatedCustomer });
      return updatedCustomer;
    } catch (err) {
      set({ error: 'เกิดข้อผิดพลาดในการอัปเดตลูกค้า (Online)' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // ✏️ Update (POS)
  updateCustomerProfilePosAction: async (id, data) => {
    set({ isLoading: true, error: null });
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
      set({ isLoading: false });
    }
  },

  // 👤 Get my profile (Online/Customer self)
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

  // 👤 Get my profile (POS/staff viewing)
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

  // 🧰 Setters
  setCustomer: (customer) => set({ customer }),
  resetCustomer: () => set({ customer: null, error: null }),

  // 🔁 Backward-compatible aliases
  createCustomerAction: async (data) => {
    return await useCustomerStore.getState().createCustomer(data);
  },
  updateCustomerProfileAction: async (data, mode = 'online') => {
    if (mode === 'pos') {
      const { id, ...payload } = data || {};
      const safeId = Number(id);
      if (!Number.isFinite(safeId)) throw new Error('INVALID_CUSTOMER_ID');
      return await useCustomerStore.getState().updateCustomerProfilePosAction(safeId, payload);
    }
    return await useCustomerStore.getState().updateCustomerProfileOnlineAction(data);
  },
  getMyCustomerProfileOnline: async () => {
    return await useCustomerStore.getState().getMyCustomerProfileOnlineAction();
  },
  getMyCustomerProfilePos: async () => {
    return await useCustomerStore.getState().getMyCustomerProfilePosAction();
  },
}));

export default useCustomerStore;
