// ✅ เพิ่ม Action ที่จำเป็นสำหรับการใช้งานใน CustomerSection.jsx

import { create } from 'zustand';
import { getCustomerByPhone, createCustomer, updateCustomer, getCustomerByName } from '../api/customerApi';

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

    updateCustomerProfile: async (updatedData) => {
        set({ isLoading: true, error: null });
        try {
            const updatedCustomer = await updateCustomer(updatedData);
            set({ customer: updatedCustomer });
            return updatedCustomer;
        } catch (err) {
            console.error('[updateCustomerProfile] ❌', err);
            set({ error: 'เกิดข้อผิดพลาดในการอัปเดตลูกค้า' });
            throw err;
        } finally {
            set({ isLoading: false });
        }
    },

    resetCustomer: () => {
        set({ customer: null, error: null });
    },

    setCustomer: (customer) => set({ customer }),

    // ✅ เพิ่ม alias สำหรับ compatibility กับ CustomerSection
    createCustomerAction: async (data) => {
        return await useCustomerStore.getState().createCustomer(data);
    },

    updateCustomerProfileAction: async (data) => {
        return await useCustomerStore.getState().updateCustomerProfile(data);
    },
}));

export default useCustomerStore;
