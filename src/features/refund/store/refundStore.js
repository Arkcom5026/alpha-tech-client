// refund/store/refundStore.js
import { create } from 'zustand';
import { createRefundTransaction } from '../api/refundApi';

const useRefundStore = create((set) => ({
  loading: false,
  error: null,

  createRefundAction: async (refundData) => {
    try {
      set({ loading: true, error: null });
      const result = await createRefundTransaction(refundData);
      return result;
    } catch (err) {
      set({ error: err.message || 'เกิดข้อผิดพลาดในการบันทึกการคืนเงิน' });
      throw err;
    } finally {
      set({ loading: false });
    }
  },
}));

export default useRefundStore;
