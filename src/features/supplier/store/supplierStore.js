// src/features/supplier/store/supplierStore.js
import { create } from 'zustand';
import {
  createSupplier,
  deleteSupplier,
  getAllSuppliers,
  updateSupplier,
  getSupplierById,
} from '../api/supplierApi';
import { useBranchStore } from '@/features/branch/store/branchStore';

const useSupplierStore = create((set, get) => ({
  suppliers: [],
  selectedSupplier: null,
  supplierError: null,
  isSupplierLoading: false,

  // ✅ รายชื่อสำหรับ dropdown พร้อมใช้
  getSupplierOptions: () =>
    (get().suppliers || []).map(s => ({ id: Number(s.id), name: s?.name ?? '-' })),

  // ✅ โหลด supplier ทั้งหมด (ตามสาขาปัจจุบัน)
  fetchSuppliersAction: async () => {
    const branchId = useBranchStore.getState().selectedBranchId;
    if (!branchId) return;
    set({ isSupplierLoading: true, supplierError: null });
    try {
      const data = await getAllSuppliers({ branchId });
      const safe = Array.isArray(data) ? data : [];
      // กันชื่อว่าง & เรียง A-Z
      const sorted = [...safe].sort((a, b) =>
        (a?.name ?? '').localeCompare(b?.name ?? '', 'th')
      );
      set({ suppliers: sorted });
    } catch (err) {
      console.error('❌ fetchSuppliersAction error:', err);
      set({ supplierError: String(err?.message || err) });
    } finally {
      set({ isSupplierLoading: false });
    }
  },

  // ✅ โหลด supplier รายตัว
  fetchSupplierByIdAction: async (id) => {
    const parsedId = Number(id);
    if (Number.isNaN(parsedId)) {
      console.error('❌ [fetchSupplierByIdAction] invalid id', id);
      return set({ supplierError: 'ID ไม่ถูกต้อง' });
    }
    set({ isSupplierLoading: true, supplierError: null });
    try {
      const res = await getSupplierById(parsedId);
      set({ selectedSupplier: res });
    } catch (err) {
      console.error('❌ [fetchSupplierByIdAction] error:', err);
      set({ supplierError: String(err?.message || err) });
    } finally {
      set({ isSupplierLoading: false });
    }
  },

  createSupplierAction: async (form) => {
    set({ supplierError: null });
    try {
      const res = await createSupplier(form);
      set((state) => ({ suppliers: [...state.suppliers, res] }));
    } catch (err) {
      console.error('❌ [createSupplierAction] error:', err);
      set({ supplierError: String(err?.message || err) });
    }
  },

  updateSupplierAction: async (id, form) => {
    const parsedId = Number(id);
    if (Number.isNaN(parsedId)) {
      console.error('❌ [updateSupplierAction] invalid id', id);
      return set({ supplierError: 'ID ไม่ถูกต้อง' });
    }
    set({ supplierError: null });
    try {
      const updated = await updateSupplier(parsedId, form);
      set((state) => ({
        suppliers: state.suppliers.map((s) => (s.id === parsedId ? updated : s)),
      }));
    } catch (err) {
      console.error('❌ [updateSupplierAction] error:', err);
      set({ supplierError: String(err?.message || err) });
    }
  },

  deleteSupplierAction: async (id) => {
    const parsedId = Number(id);
    if (Number.isNaN(parsedId)) {
      console.error('❌ [deleteSupplierAction] invalid id', id);
      return set({ supplierError: 'ID ไม่ถูกต้อง' });
    }
    set({ supplierError: null });
    try {
      await deleteSupplier(parsedId);
      set((state) => ({
        suppliers: state.suppliers.filter((s) => s.id !== parsedId),
      }));
    } catch (err) {
      console.error('❌ [deleteSupplierAction] error:', err);
      set({ supplierError: String(err?.message || err) });
    }
  },

  resetSupplierState: () => set({
    suppliers: [],
    selectedSupplier: null,
    supplierError: null,
    isSupplierLoading: false,
  }),
}));

export default useSupplierStore;
