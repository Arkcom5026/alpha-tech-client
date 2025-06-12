// ✅ supplierStore.js (อัปเดตชื่อฟังก์ชัน + เพิ่มให้ครบ)
import { create } from 'zustand';
import {
  createSupplier,
  deleteSupplier,
  getAllSuppliers,
  updateSupplier,
  getSupplierById,
} from '../api/supplierApi';

const useSupplierStore = create((set) => ({
  suppliers: [],
  selectedSupplier: null,
  supplierError: null,
  isSupplierLoading: false,

  // ✅ โหลด supplier ทั้งหมด
  fetchAllSuppliersAction: async () => {
    set({ isSupplierLoading: true });
    try {
      const res = await getAllSuppliers();
      set({ suppliers: res, isSupplierLoading: false });
    } catch (err) {
      console.error('❌ [fetchAllSuppliersAction] error:', err);
      set({ supplierError: err.message, isSupplierLoading: false });
    }
  },

  // ✅ โหลด supplier รายตัว (ใช้ในหน้า detail/payment)
  fetchSupplierByIdAction: async (id) => {
    try {
      const res = await getSupplierById(id);
      console.log('fetchSupplierByIdAction : ',res)
      set({ selectedSupplier: res });
    } catch (err) {
      console.error('❌ [fetchSupplierByIdAction] error:', err);
      set({ supplierError: err.message });
    }
  },

  // ✅ เพิ่ม supplier ใหม่
  createSupplierAction: async (form) => {
    try {
      const res = await createSupplier(form);
      set((state) => ({ suppliers: [...state.suppliers, res] }));
    } catch (err) {
      console.error('❌ [createSupplierAction] error:', err);
      set({ supplierError: err.message });
    }
  },

  // ✅ แก้ไขข้อมูล supplier
  updateSupplierAction: async (id, form) => {
    try {
      const updated = await updateSupplier(id, form);
      set((state) => ({
        suppliers: state.suppliers.map((s) => (s.id === id ? updated : s)),
      }));
    } catch (err) {
      console.error('❌ [updateSupplierAction] error:', err);
      set({ supplierError: err.message });
    }
  },

  // ✅ ลบ supplier
  deleteSupplierAction: async (id) => {
    try {
      await deleteSupplier(id);
      set((state) => ({
        suppliers: state.suppliers.filter((s) => s.id !== id),
      }));
    } catch (err) {
      console.error('❌ [deleteSupplierAction] error:', err);
      set({ supplierError: err.message });
    }
  },
}));

export default useSupplierStore;
