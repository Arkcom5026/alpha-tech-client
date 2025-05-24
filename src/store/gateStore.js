// ✅ src/store/gateStore.js
import { create } from 'zustand';

const useGateStore = create((set) => ({
  isGatePassed: false,
  passGate: () => set({ isGatePassed: true }),
  resetGate: () => set({ isGatePassed: false }),
}));

export default useGateStore;