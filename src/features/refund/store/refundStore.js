// refund/store/refundStore.js
import { create } from 'zustand';
import { createRefundTransaction } from '../api/refundApi';

const useRefundStore = create((set, get) => ({
  loading: false,
  error: null,

  clearErrorAction: () => set({ error: null }),

  createRefundAction: async (refundData) => {
    if (get().loading) return null;
    try {
      set({ loading: true, error: null });
      const result = await createRefundTransaction(refundData);
      return result;
    } catch (err) {
      set({ error: err?.message || 'เกิดข้อผิดพลาดในการบันทึกการคืนเงิน' });
      throw err;
    } finally {
      set({ loading: false });
    }
  },
}));

export default useRefundStore;
