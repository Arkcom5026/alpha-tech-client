import { create } from 'zustand';
import { createSaleCreateRuntimeSlice } from './saleCreateRuntimeSlice';

const useSaleCreateStore = create((set, get) => ({
  loading: false,
  error: null,
  clearErrorAction: () => set({ error: null }),
  setErrorAction: (message) => set({ error: message || null }),
  ...createSaleCreateRuntimeSlice(set, get),
}));

export default useSaleCreateStore;
