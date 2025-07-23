import { create } from 'zustand';
import {
  getCustomerByPhone,
  createCustomer,
  updateCustomerProfileOnline,
  updateCustomerProfilePos,
  getCustomerByName,
  getMyCustomerProfileOnline,
  getMyCustomerProfilePos,
} from '../api/customerApi';

const useCustomerStore = create((set) => ({
  customer: null,
  isLoading: false,
  error: null,

  searchedCustomers: [],
  isSearching: false,
  searchError: null,

  searchCustomers: async (query) => {
    set({ isSearching: true, searchError: null });
    try {
      const data = await getCustomerByName(query);
      set({ searchedCustomers: data });
      return data;
    } catch (err) {
      console.error('[searchCustomers] ❌', err);
      set({ searchedCustomers: [], searchError: 'ไม่สามารถค้นหาลูกค้าได้' });
      throw err;
    } finally {
      set({ isSearching: false });
    }
  },

  clearSearchedCustomers: () => {
    set({ searchedCustomers: [], searchError: null });
  },

  getCustomerByPhone: async (phone) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getCustomerByPhone(phone);
      set({ customer: data });
      return data;
    } catch (err) {
      console.error('[getCustomerByPhone] ❌', err);
      set({ customer: null, error: 'ไม่พบลูกค้า' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  createCustomer: async (customerData) => {
    set({ isLoading: true, error: null });
    try {
      const newCustomer = await createCustomer(customerData);
      set({ customer: newCustomer });
      return newCustomer;
    } catch (err) {
      console.error('[createCustomer] ❌', err);
      set({ error: 'เกิดข้อผิดพลาดในการสร้างลูกค้า' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  updateCustomerProfileOnline: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const updatedCustomer = await updateCustomerProfileOnline(data);
      set({ customer: updatedCustomer });
      return updatedCustomer;
    } catch (err) {
      console.error('[updateCustomerProfileOnline] ❌', err);
      set({ error: 'เกิดข้อผิดพลาดในการอัปเดตลูกค้า (Online)' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  updateCustomerProfilePos: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const updatedCustomer = await updateCustomerProfilePos(data);
      set({ customer: updatedCustomer });
      return updatedCustomer;
    } catch (err) {
      console.error('[updateCustomerProfilePos] ❌', err);
      set({ error: 'เกิดข้อผิดพลาดในการอัปเดตลูกค้า (POS)' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  getMyCustomerProfileOnline: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getMyCustomerProfileOnline();
      set({ customer: data });
      return data;
    } catch (err) {
      console.error('[getMyCustomerProfileOnline] ❌', err);
      set({ customer: null, error: 'โหลดข้อมูลลูกค้าไม่สำเร็จ (Online)' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  getMyCustomerProfilePos: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getMyCustomerProfilePos();
      set({ customer: data });
      return data;
    } catch (err) {
      console.error('[getMyCustomerProfilePos] ❌', err);
      set({ customer: null, error: 'โหลดข้อมูลลูกค้าไม่สำเร็จ (POS)' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  setCustomer: (customer) => set({ customer }),

  resetCustomer: () => {
    set({ customer: null, error: null });
  },

  // ✅ alias สำหรับ compatibility
  createCustomerAction: async (data) => {
    return await useCustomerStore.getState().createCustomer(data);
  },

  updateCustomerProfileAction: async (data, mode = 'online') => {
    if (mode === 'pos') {
      return await useCustomerStore.getState().updateCustomerProfilePos(data);
    } else {
      return await useCustomerStore.getState().updateCustomerProfileOnline(data);
    }
  },
}));

export default useCustomerStore;
