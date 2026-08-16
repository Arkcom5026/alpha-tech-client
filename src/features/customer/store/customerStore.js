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
let customerSearchRequestSequence = 0;
let customerRecordRequestSequence = 0;

const invalidateCustomerRecordReads = () => {
  customerRecordRequestSequence += 1;
};

const useCustomerStore = create((set, get) => ({
  customer: null,
  isLoading: false,
  isMutating: false,
  error: null,
  searchedCustomers: [],
  isSearching: false,
  searchError: null,

  searchStoreCustomersAction: async (query) => {
    const requestId = ++customerSearchRequestSequence;
    const ownsSearchRequest = () => customerSearchRequestSequence === requestId;
    set({ isSearching: true, searchError: null });
    try {
      const payload = await searchStoreCustomers(query);
      if (!ownsSearchRequest()) return null;
      const results = Array.isArray(payload?.results) ? payload.results : [];
      set({ searchedCustomers: results });
      return payload;
    } catch (err) {
      if (!ownsSearchRequest()) return null;
      const message = err?.response?.data?.message || err?.message || 'ไม่สามารถค้นหาลูกค้าได้';
      set({ searchedCustomers: [], searchError: message });
      throw err;
    } finally {
      if (ownsSearchRequest()) set({ isSearching: false });
    }
  },

  searchCustomers: async (query) => {
    const requestId = ++customerSearchRequestSequence;
    const ownsSearchRequest = () => customerSearchRequestSequence === requestId;
    set({ isSearching: true, searchError: null });
    try {
      const data = await getCustomerByName(query);
      if (!ownsSearchRequest()) return null;
      set({ searchedCustomers: data });
      return data;
    } catch (err) {
      if (!ownsSearchRequest()) return null;
      set({ searchedCustomers: [], searchError: 'ไม่สามารถค้นหาลูกค้าได้' });
      throw err;
    } finally {
      if (ownsSearchRequest()) set({ isSearching: false });
    }
  },

  clearSearchedCustomers: () => {
    customerSearchRequestSequence += 1;
    set({ searchedCustomers: [], searchError: null, isSearching: false });
  },

  getCustomerByPhone: async (phone) => {
    if (get().isMutating) return null;
    const phoneSnapshot = String(phone ?? '').trim();
    const requestId = ++customerRecordRequestSequence;
    const ownsRecordRequest = () => customerRecordRequestSequence === requestId;
    set({ isLoading: true, error: null });
    try {
      const data = await getCustomerByPhone(phoneSnapshot);
      if (!ownsRecordRequest()) return null;
      set({ customer: data });
      return data;
    } catch (err) {
      if (!ownsRecordRequest()) return null;
      set({ customer: null, error: 'ไม่พบลูกค้า' });
      throw err;
    } finally {
      if (ownsRecordRequest()) set({ isLoading: false });
    }
  },

  createCustomer: async (customerData) => {
    if (get().isMutating) throw mutationBusyError();
    invalidateCustomerRecordReads();
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
    invalidateCustomerRecordReads();
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
    invalidateCustomerRecordReads();
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
    if (get().isMutating) return null;
    const requestId = ++customerRecordRequestSequence;
    const ownsRecordRequest = () => customerRecordRequestSequence === requestId;
    set({ isLoading: true, error: null });
    try {
      const data = await getMyCustomerProfileOnlineApi();
      if (!ownsRecordRequest()) return null;
      set({ customer: data });
      return data;
    } catch (err) {
      if (!ownsRecordRequest()) return null;
      set({ customer: null, error: 'โหลดข้อมูลลูกค้าไม่สำเร็จ (Online)' });
      throw err;
    } finally {
      if (ownsRecordRequest()) set({ isLoading: false });
    }
  },

  getMyCustomerProfilePosAction: async () => {
    if (get().isMutating) return null;
    const requestId = ++customerRecordRequestSequence;
    const ownsRecordRequest = () => customerRecordRequestSequence === requestId;
    set({ isLoading: true, error: null });
    try {
      const data = await getMyCustomerProfilePosApi();
      if (!ownsRecordRequest()) return null;
      set({ customer: data });
      return data;
    } catch (err) {
      if (!ownsRecordRequest()) return null;
      set({ customer: null, error: 'โหลดข้อมูลลูกค้าไม่สำเร็จ (POS)' });
      throw err;
    } finally {
      if (ownsRecordRequest()) set({ isLoading: false });
    }
  },

  setCustomer: (customer) => {
    invalidateCustomerRecordReads();
    set({ customer, error: null, isLoading: false });
  },
  resetCustomer: () => {
    invalidateCustomerRecordReads();
    set({ customer: null, error: null, isLoading: false });
  },

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
