// ✅ supplierStore.js 
import { create } from 'zustand';
import {
  createSupplier,
  deleteSupplier,
  getAllSuppliers,
  updateSupplier,
} from '../api/supplierApi';

const useSupplierStore = create((set) => ({
  suppliers: [],
  supplierError: null,

  getSuppliers: async (token, branchId) => {
    try {
      const res = await getAllSuppliers(branchId);
      set({ suppliers: res });
    } catch (err) {
      console.error('❌ getSuppliers error:', err);
      set({ supplierError: err.message });
    }
  },

  addSupplier: async (token, form) => {
    try {
      const res = await createSupplier(form);
      set((state) => ({ suppliers: [...state.suppliers, res] }));
    } catch (err) {
      console.error('❌ addSupplier error:', err);
      set({ supplierError: err.message });
    }
  },

  updateSupplier: async (token, id, form) => {
    try {
      const updated = await updateSupplier(id, form);
      set((state) => ({
        suppliers: state.suppliers.map((s) => (s.id === id ? updated : s)),
      }));
    } catch (err) {
      console.error('❌ updateSupplier error:', err);
      set({ supplierError: err.message });
    }
  },

  removeSupplier: async (token, id) => {
    try {
      await deleteSupplier(id);
      set((state) => ({
        suppliers: state.suppliers.filter((s) => s.id !== id),
      }));
    } catch (err) {
      console.error('❌ removeSupplier error:', err);
      set({ supplierError: err.message });
    }
  },
}));

export default useSupplierStore;


