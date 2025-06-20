// ✅ supplierStore.js (อัปเดตชื่อฟังก์ชัน + เพิ่มให้ครบ)
import { create } from 'zustand';
import {
  createSupplier,
  deleteSupplier,
  getAllSuppliers,
  updateSupplier,
  getSupplierById,
} from '../api/supplierApi';
import { useBranchStore } from '@/features/branch/store/branchStore';

const useSupplierStore = create((set) => ({
  suppliers: [],
  selectedSupplier: null,
  supplierError: null,
  isSupplierLoading: false,

  // ✅ โหลด supplier ทั้งหมด
  fetchSuppliersAction: async () => {
    const branchId = useBranchStore.getState().selectedBranchId;
    if (!branchId) return;
    try {
      const data = await getAllSuppliers({ branchId });
      // ✅ เรียงตามตัวอักษร A-Z
      const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
      set({ suppliers: sorted });
    } catch (err) {
      console.error('❌ fetchAllSuppliersAction error:', err);
      set({ error: err });
    }
  },

  // ✅ โหลด supplier รายตัว (ใช้ในหน้า detail/payment)
  fetchSupplierByIdAction: async (id) => {
    const parsedId = Number(id);
    if (isNaN(parsedId)) {
      console.error('❌ [fetchSupplierByIdAction] error: invalid id', id);
      return set({ supplierError: 'ID ไม่ถูกต้อง' });
    }
    try {
      const res = await getSupplierById(parsedId);
      console.log('fetchSupplierByIdAction : ', res);
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
    const parsedId = Number(id);
    if (isNaN(parsedId)) {
      console.error('❌ [updateSupplierAction] error: invalid id', id);
      return set({ supplierError: 'ID ไม่ถูกต้อง' });
    }
    try {
      const updated = await updateSupplier(parsedId, form);
      set((state) => ({
        suppliers: state.suppliers.map((s) => (s.id === parsedId ? updated : s)),
      }));
    } catch (err) {
      console.error('❌ [updateSupplierAction] error:', err);
      set({ supplierError: err.message });
    }
  },

  // ✅ ลบ supplier
  deleteSupplierAction: async (id) => {
    const parsedId = Number(id);
    if (isNaN(parsedId)) {
      console.error('❌ [deleteSupplierAction] error: invalid id', id);
      return set({ supplierError: 'ID ไม่ถูกต้อง' });
    }
    try {
      await deleteSupplier(parsedId);
      set((state) => ({
        suppliers: state.suppliers.filter((s) => s.id !== parsedId),
      }));
    } catch (err) {
      console.error('❌ [deleteSupplierAction] error:', err);
      set({ supplierError: err.message });
    }
  },

  // ✅ reset state (optional สำหรับ logout/staging)
  resetSupplierState: () => set({
    suppliers: [],
    selectedSupplier: null,
    supplierError: null,
    isSupplierLoading: false,
  }),
}));

export default useSupplierStore;
