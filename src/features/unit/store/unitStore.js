// features/unit/store/unitStore.js
import { create } from 'zustand';

const useUnitStore = create((set) => ({
  units: [],
  setUnits: (units) => set({ units }),

  resetUnits: () => set({ units: [] }),
}));

export default useUnitStore;
