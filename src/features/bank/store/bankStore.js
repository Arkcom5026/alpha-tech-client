// ✅ bankStore.js – จัดการสถานะธนาคารทั้งหมดด้วย Zustand
import { create } from 'zustand';
import { getAllBanks } from '@/features/bank/api/bankApi';

const useBankStore = create((set) => ({
  banks: [],
  bankLoading: false,
  bankError: null,

  fetchBanksAction: async () => {
    try {
      set({ bankLoading: true, bankError: null });
      const banks = await getAllBanks();
      set({ banks });
    } catch (err) {
      console.error('❌ โหลดธนาคารล้มเหลว:', err);
      set({ bankError: 'ไม่สามารถโหลดรายชื่อธนาคารได้' });
    } finally {
      set({ bankLoading: false });
    }
  },
}));

export default useBankStore;
