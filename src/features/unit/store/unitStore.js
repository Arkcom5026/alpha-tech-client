// ✅ src/features/unit/store/unitStore.js

import { create } from 'zustand';
import { getAllUnits, createUnit, updateUnit, deleteUnit, getUnitById } from '../api/unitApi';

const useUnitStore = create((set) => ({
  units: [],
  currentUnit: null,
  isLoading: false,
  error: null,

  fetchUnits: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getAllUnits();
      set({ units: data, isLoading: false });
      

    } catch (err) {
      console.error('❌ fetchUnits error:', err);
      set({ error: 'โหลดหน่วยไม่สำเร็จ', isLoading: false });
    }
  },

  getUnitById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getUnitById(id);
      set({ currentUnit: data, isLoading: false });
      return data;
    } catch (err) {
      console.error('❌ getUnitById error:', err);
      set({ error: 'ดึงข้อมูลหน่วยไม่สำเร็จ', isLoading: false });
      return null;
    }
  },

  addUnit: async (unitData) => {
    set({ isLoading: true, error: null });
    try {
      const created = await createUnit(unitData);
      set((state) => ({ units: [created, ...state.units], isLoading: false }));
      return created;
    } catch (err) {
      console.error('❌ addUnit error:', err);
      set({ error: 'เพิ่มหน่วยไม่สำเร็จ', isLoading: false });
      return null;
    }
  },

  updateUnit: async (id, unitData) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updateUnit(id, unitData);
      set((state) => ({
        units: state.units.map((u) => (u.id === id ? updated : u)),
        isLoading: false,
      }));
      return updated;
    } catch (err) {
      console.error('❌ updateUnit error:', err);
      set({ error: 'อัปเดตหน่วยไม่สำเร็จ', isLoading: false });
      return null;
    }
  },

  deleteUnit: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await deleteUnit(id);
      set((state) => ({
        units: state.units.filter((u) => u.id !== id),
        isLoading: false,
      }));
      return true;
    } catch (err) {
      console.error('❌ deleteUnit error:', err);
      set({ error: 'ลบหน่วยไม่สำเร็จ', isLoading: false });
      return false;
    }
  },
}));

export default useUnitStore;
