// src/features/unit/store/unitStore.js
import { create } from 'zustand';
import {
  createUnit,
  deleteUnit,
  getAllUnits,
  getUnitById,
  updateUnit,
} from '../api/unitApi';

const normalizeError = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const sortUnits = (units) =>
  [...(Array.isArray(units) ? units : [])].sort((a, b) =>
    String(a?.name || '').localeCompare(String(b?.name || ''), 'th')
  );

const useUnitStore = create((set, get) => ({
  units: [],
  currentUnit: null,
  loading: false,
  submitting: false,
  error: null,
  search: '',
  page: 1,
  limit: 20,

  setSearchAction: (search) => set({ search, page: 1 }),
  setPageAction: (page) => set({ page: Math.max(1, Number(page) || 1) }),
  setLimitAction: (limit) => set({ limit: Number(limit) || 20, page: 1 }),

  fetchUnitsAction: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getAllUnits();
      set({ units: sortUnits(data) });
      return data;
    } catch (error) {
      const message = normalizeError(error, 'โหลดรายการหน่วยนับไม่สำเร็จ');
      set({ error: message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  refreshAction: async () => get().fetchUnitsAction(),

  fetchUnitByIdAction: async (id) => {
    const parsedId = Number(id);
    if (!Number.isFinite(parsedId)) {
      const error = new Error('รหัสหน่วยนับไม่ถูกต้อง');
      set({ error: error.message });
      throw error;
    }

    set({ loading: true, error: null });
    try {
      const data = await getUnitById(parsedId);
      set({ currentUnit: data });
      return data;
    } catch (error) {
      set({ error: normalizeError(error, 'ดึงข้อมูลหน่วยนับไม่สำเร็จ') });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  createUnitAction: async (unitData) => {
    set({ submitting: true, error: null });
    try {
      const created = await createUnit(unitData);
      set((state) => ({ units: sortUnits([...state.units, created]) }));
      return created;
    } catch (error) {
      set({ error: normalizeError(error, 'เพิ่มหน่วยนับไม่สำเร็จ') });
      throw error;
    } finally {
      set({ submitting: false });
    }
  },

  updateUnitAction: async (id, unitData) => {
    const parsedId = Number(id);
    set({ submitting: true, error: null });
    try {
      const updated = await updateUnit(parsedId, unitData);
      set((state) => ({
        units: sortUnits(state.units.map((unit) => (Number(unit.id) === parsedId ? updated : unit))),
        currentUnit: updated,
      }));
      return updated;
    } catch (error) {
      set({ error: normalizeError(error, 'อัปเดตหน่วยนับไม่สำเร็จ') });
      throw error;
    } finally {
      set({ submitting: false });
    }
  },

  deleteUnitAction: async (id) => {
    const parsedId = Number(id);
    set({ submitting: true, error: null });
    try {
      await deleteUnit(parsedId);
      set((state) => ({
        units: state.units.filter((unit) => Number(unit.id) !== parsedId),
      }));
      return true;
    } catch (error) {
      set({ error: normalizeError(error, 'ลบหน่วยนับไม่สำเร็จ') });
      throw error;
    } finally {
      set({ submitting: false });
    }
  },

  clearUnitErrorAction: () => set({ error: null }),

  resetUnitState: () =>
    set({
      units: [],
      currentUnit: null,
      loading: false,
      submitting: false,
      error: null,
      search: '',
      page: 1,
      limit: 20,
    }),

  // Compatibility aliases for existing create/edit screens.
  fetchUnits: async () => get().fetchUnitsAction(),
  getUnitById: async (id) => get().fetchUnitByIdAction(id),
  addUnit: async (unitData) => get().createUnitAction(unitData),
  updateUnit: async (id, unitData) => get().updateUnitAction(id, unitData),
  deleteUnit: async (id) => get().deleteUnitAction(id),
  get isLoading() {
    return get().loading || get().submitting;
  },
}));

export default useUnitStore;
