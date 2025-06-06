import { create } from 'zustand';
import { getCustomerByPhone, createCustomer } from '../api/customerApi';

const useCustomerStore = create((set) => ({
  customer: null,
  loading: false,
  error: null,

  // 🔍 ค้นหาลูกค้าจากเบอร์โทร
  searchCustomerByPhoneAction: async (phone) => {
    set({ loading: true, error: null });
    try {
      const data = await getCustomerByPhone(phone);
      set({ customer: data });
    } catch (err) {
      set({ customer: null, error: 'ไม่พบลูกค้า' });
    } finally {
      set({ loading: false });
    }
  },

  // 🆕 สร้างลูกค้าใหม่แบบด่วน
  createCustomerAction: async (customerData) => {
    set({ loading: true, error: null });
    try {
      const newCustomer = await createCustomer(customerData);
      set({ customer: newCustomer });
    } catch (err) {
      console.error('[createCustomerAction] ❌', err);
      set({ error: 'เกิดข้อผิดพลาดในการสร้างลูกค้า' });
    } finally {
      set({ loading: false });
    }
  },

  // 🔄 รีเซ็ตข้อมูลลูกค้า (หากต้องการเริ่มใหม่)
  resetCustomer: () => {
    set({ customer: null, error: null });
  }
}));

export default useCustomerStore;
