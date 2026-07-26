// src/features/supplier/store/supplierStore.js
import { create } from 'zustand';
import {
  createSupplier,
  deleteSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
} from '../api/supplierApi';
import { useBranchStore } from '@/features/branch/store/branchStore';
import { useAuthStore } from '@/features/auth/store/authStore';
import { parseApiError } from '@/utils/uiHelpers';

const sortSuppliers = (items = []) =>
  [...items].sort((a, b) => String(a?.name || '').localeCompare(String(b?.name || ''), 'th'));

const useSupplierStore = create((set, get) => ({
  suppliers: [],
  selectedSupplier: null,
  supplierError: null,
  isSupplierLoading: false,
  isSupplierSaving: false,
  search: '',
  page: 1,
  limit: 20,

  setSearchAction: (search) => set({ search: search ?? '', page: 1 }),
  setPageAction: (page) => set({ page: Math.max(1, Number(page) || 1) }),
  setLimitAction: (limit) => set({ limit: Number(limit) || 20, page: 1 }),
  clearSupplierError: () => set({ supplierError: null }),

  getSupplierOptions: () =>
    (get().suppliers || []).map((supplier) => ({
      id: Number(supplier.id),
      name: supplier?.name ?? '-',
    })),

  fetchSuppliersAction: async (explicitBranchId) => {
    const authState = useAuthStore.getState();
    const resolvedBranchId =
      explicitBranchId || authState.employee?.branchId || useBranchStore.getState().selectedBranchId;

    if (!resolvedBranchId) {
      set({ suppliers: [], supplierError: null, isSupplierLoading: false });
      return [];
    }

    set({ isSupplierLoading: true, supplierError: null });
    try {
      const data = await getAllSuppliers({ branchId: Number(resolvedBranchId) });
      const suppliers = sortSuppliers(Array.isArray(data) ? data : []);
      set({ suppliers });
      return suppliers;
    } catch (err) {
      const message = parseApiError(err) || 'ไม่สามารถโหลดบัญชีรายชื่อผู้ขายได้';
      set({ supplierError: message, suppliers: [] });
      throw err;
    } finally {
      set({ isSupplierLoading: false });
    }
  },

  refreshAction: async () => get().fetchSuppliersAction(),

  fetchSupplierByIdAction: async (id) => {
    const parsedId = Number(id);
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      set({ supplierError: 'ID ผู้ขายไม่ถูกต้อง', selectedSupplier: null });
      return null;
    }

    set({ isSupplierLoading: true, supplierError: null, selectedSupplier: null });
    try {
      const supplier = await getSupplierById(parsedId);
      set({ selectedSupplier: supplier });
      return supplier;
    } catch (err) {
      const message = parseApiError(err) || 'ไม่สามารถโหลดข้อมูลผู้ขายได้';
      set({ supplierError: message });
      return null;
    } finally {
      set({ isSupplierLoading: false });
    }
  },

  createSupplierAction: async (form) => {
    set({ isSupplierSaving: true, supplierError: null });
    try {
      const created = await createSupplier(form);
      set((state) => ({ suppliers: sortSuppliers([...(state.suppliers || []), created]) }));
      return created;
    } catch (err) {
      const message = parseApiError(err) || 'ไม่สามารถเพิ่มข้อมูลผู้ขายได้';
      set({ supplierError: message });
      throw err;
    } finally {
      set({ isSupplierSaving: false });
    }
  },

  updateSupplierAction: async (id, form) => {
    const parsedId = Number(id);
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      const error = new Error('ID ผู้ขายไม่ถูกต้อง');
      set({ supplierError: error.message });
      throw error;
    }

    set({ isSupplierSaving: true, supplierError: null });
    try {
      const updated = await updateSupplier(parsedId, form);
      set((state) => ({
        suppliers: sortSuppliers(
          (state.suppliers || []).map((supplier) =>
            Number(supplier.id) === parsedId ? updated : supplier
          )
        ),
        selectedSupplier: updated,
      }));
      return updated;
    } catch (err) {
      const message = parseApiError(err) || 'ไม่สามารถแก้ไขข้อมูลผู้ขายได้';
      set({ supplierError: message });
      throw err;
    } finally {
      set({ isSupplierSaving: false });
    }
  },

  deleteSupplierAction: async (id) => {
    const parsedId = Number(id);
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      const error = new Error('ID ผู้ขายไม่ถูกต้อง');
      set({ supplierError: error.message });
      throw error;
    }

    set({ isSupplierSaving: true, supplierError: null });
    try {
      await deleteSupplier(parsedId);
      set((state) => ({
        suppliers: (state.suppliers || []).filter((supplier) => Number(supplier.id) !== parsedId),
        selectedSupplier:
          Number(state.selectedSupplier?.id) === parsedId ? null : state.selectedSupplier,
      }));
      return true;
    } catch (err) {
      const message = parseApiError(err) || 'ไม่สามารถลบข้อมูลผู้ขายได้';
      set({ supplierError: message });
      throw err;
    } finally {
      set({ isSupplierSaving: false });
    }
  },

  resetSupplierState: () =>
    set({
      suppliers: [],
      selectedSupplier: null,
      supplierError: null,
      isSupplierLoading: false,
      isSupplierSaving: false,
      search: '',
      page: 1,
      limit: 20,
    }),
}));

export default useSupplierStore;
