// ✅ Store (ปรับปรุงให้รองรับการค้นหาแบบ List)
import { create } from 'zustand';
import { getCustomerByPhone, createCustomer, updateCustomer, getCustomerByName } from '../api/customerApi';

const useCustomerStore = create((set) => ({
    // --- State สำหรับจัดการลูกค้าคนเดียว (เช่น ในหน้า POS) ---
    customer: null,
    isLoading: false,
    error: null,

    // --- State สำหรับจัดการผลการค้นหา (สำหรับ Filter/Autocomplete) ---
    searchedCustomers: [],
    isSearching: false,
    searchError: null,

    // --- Actions (แก้ไขชื่อให้กระชับ) ---

    /**
     * ค้นหาลูกค้า (สำหรับ Autocomplete)
     * @param {string} query - คำค้นหา (ชื่อหรือเบอร์โทร)
     * @returns {Promise<Array>} - รายการลูกค้าที่ค้นเจอ
     */
    searchCustomers: async (query) => {
        set({ isSearching: true, searchError: null });
        try {
            const data = await getCustomerByName(query); // API นี้คืนค่าเป็น Array
            set({ searchedCustomers: data });
            return data;
        } catch (err) {
            console.error('[searchCustomers] ❌', err);
            set({ searchedCustomers: [], searchError: 'ไม่สามารถค้นหาลูกค้าได้' });
            throw err; // ส่งต่อ error ให้ component จัดการ
        } finally {
            set({ isSearching: false });
        }
    },
    
    /**
     * ล้างผลการค้นหา
     */
    clearSearchedCustomers: () => {
        set({ searchedCustomers: [], searchError: null });
    },

    /**
     * ดึงข้อมูลลูกค้าคนเดียวจากเบอร์โทร
     */
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

    /**
     * สร้างลูกค้าใหม่
     */
    createCustomer: async (customerData) => {
        set({ isLoading: true, error: null });
        try {
            const newCustomer = await createCustomer(customerData);
            set({ customer: newCustomer }); // ตั้งเป็นลูกค้าปัจจุบัน
            return newCustomer;
        } catch (err) {
            console.error('[createCustomer] ❌', err);
            set({ error: 'เกิดข้อผิดพลาดในการสร้างลูกค้า' });
            throw err;
        } finally {
            set({ isLoading: false });
        }
    },

    /**
     * อัปเดตข้อมูลลูกค้า
     */
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

    /**
     * รีเซ็ตข้อมูลลูกค้าที่ถูกเลือก
     */
    resetCustomer: () => {
        set({ customer: null, error: null });
    },

    /**
     * ตั้งค่าลูกค้าโดยตรง (เผื่อใช้ในกรณีอื่น)
     */
    setCustomer: (customer) => set({ customer }),
}));

export default useCustomerStore;
