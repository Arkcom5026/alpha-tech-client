// ✅ Store (เพิ่ม return ให้ action + try...catch ครบทุกฟังก์ชัน)
import { create } from 'zustand';
import { getCustomerByPhone, createCustomer, updateCustomer } from '../api/customerApi';

const useCustomerStore = create((set) => ({
  customer: null,
  loading: false,
  error: null,

  // 🔍 ค้นหาลูกค้าจากเบอร์โทร
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

  // 🆕 สร้างลูกค้าใหม่แบบด่วน
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

  // ✏️ อัปเดตข้อมูลลูกค้า
  updateCustomerAction: async (id, updatedData) => {        
    set({ loading: true, error: null });
    try {
      const updatedCustomer = await updateCustomer(id, updatedData);
      set({ customer: updatedCustomer });
      return updatedCustomer;
    } catch (err) {
      console.error('[updateCustomerAction] ❌', err);
      set({ error: 'เกิดข้อผิดพลาดในการอัปเดตลูกค้า' });
      return null;
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
