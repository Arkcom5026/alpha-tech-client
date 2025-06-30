// ✅ Store (เพิ่ม return ให้ action + try...catch ครบทุกฟังก์ชัน)
import { create } from 'zustand';
import { getCustomerByPhone, createCustomer, updateCustomer, getCustomerByName } from '../api/customerApi';

const useCustomerStore = create((set) => ({
  customer: null,
  loading: false,
  error: null,

  searchCustomerByPhoneAction: async (phone) => {
    set({ loading: true, error: null });
    try {
      const data = await getCustomerByPhone(phone);
      console.log('-data- : ', data);
      set({ customer: data });
      return data;
    } catch (err) {
      console.error('[searchCustomerByPhoneAction] ❌', err);
      set({ customer: null, error: 'ไม่พบลูกค้า' });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  searchCustomerByNameAction: async (name) => {
    set({ loading: true, error: null });
    try {
      const data = await getCustomerByName(name);
      console.log('-data (by name)- : ', data);
      set({ customer: data });
      return data;
    } catch (err) {
      console.error('[searchCustomerByNameAction] ❌', err);
      set({ customer: null, error: 'ไม่พบลูกค้าจากชื่อ' });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  createCustomerAction: async (customerData) => {
    set({ loading: true, error: null });
    try {
      const newCustomer = await createCustomer(customerData);
      set({ customer: newCustomer });
      return newCustomer;
    } catch (err) {
      console.error('[createCustomerAction] ❌', err);
      set({ error: 'เกิดข้อผิดพลาดในการสร้างลูกค้า' });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  updateCustomerProfileAction: async (updatedData) => {
    set({ loading: true, error: null });
    try {
      const updatedCustomer = await updateCustomer(updatedData);
      set({ customer: updatedCustomer });
      return updatedCustomer;
    } catch (err) {
      console.error('[updateCustomerProfileAction] ❌', err);
      set({ error: 'เกิดข้อผิดพลาดในการอัปเดตลูกค้า' });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  resetCustomer: () => {
    set({ customer: null, error: null });
  },

  setCustomer: (customer) => set({ customer }),
}));

export default useCustomerStore;
