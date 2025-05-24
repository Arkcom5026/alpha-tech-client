// ✅ src/features/bank/store/bankStore.js
import { create } from 'zustand';
import axios from 'axios';

const useBankStore = create((set) => ({
  banks: [],
  loading: false,
  error: null,

  fetchBanks: async (token) => {
    set({ loading: true });
    try {
      const res = await axios.get('/api/bank', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      set({ banks: res.data, loading: false });
    } catch (err) {
      console.error('Fetch bank error:', err.response?.data);
      set({ error: err.message, loading: false });
    }
  },

  addBankToStore: (bank) => set((state) => ({ banks: [...state.banks, bank] })),

  updateBankInStore: (updatedBank) =>
    set((state) => ({
      banks: state.banks.map((bank) =>
        bank.id === updatedBank.id ? updatedBank : bank
      ),
    })),

  removeBankFromStore: (id) =>
    set((state) => ({
      banks: state.banks.filter((bank) => bank.id !== id),
    })),
}));

export default useBankStore;
