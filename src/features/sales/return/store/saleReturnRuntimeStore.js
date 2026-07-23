import { create } from 'zustand';
import { SALE_RETURN_REFUND_METHOD } from '../contracts/saleReturnContract';

const initialRefund = () => ({
  method: SALE_RETURN_REFUND_METHOD.CASH,
  amount: 0,
  sourcePaymentItemId: '',
  referenceNo: '',
  note: '',
});

const initialState = {
  eligibility: null,
  lineState: {},
  reason: '',
  refunds: [initialRefund()],
  loading: false,
  submitting: false,
  error: '',
  completedReturn: null,
};

const useSaleReturnRuntimeStore = create((set) => ({
  ...initialState,
  startLoading: () => set({ loading: true, error: '', completedReturn: null }),
  loadSucceeded: (eligibility) => set({
    eligibility,
    lineState: {},
    reason: '',
    refunds: [initialRefund()],
    loading: false,
    error: '',
  }),
  fail: (error) => set({ loading: false, submitting: false, error }),
  selectLine: (item, selected) => set((state) => ({
    lineState: {
      ...state.lineState,
      [item.identity]: {
        selected,
        quantity: item.kind === 'SIMPLE' ? item.eligibleQuantity : 1,
        refundAmount: item.eligibleRefund,
        reason: '',
      },
    },
  })),
  patchLine: (identity, patch) => set((state) => ({
    lineState: {
      ...state.lineState,
      [identity]: { ...state.lineState[identity], ...patch },
    },
  })),
  setReason: (reason) => set({ reason }),
  patchRefund: (index, patch) => set((state) => ({
    refunds: state.refunds.map((refund, currentIndex) => (
      currentIndex === index ? { ...refund, ...patch } : refund
    )),
  })),
  addRefund: () => set((state) => ({
    refunds: [...state.refunds, initialRefund()],
  })),
  removeRefund: (index) => set((state) => ({
    refunds: state.refunds.filter((_, currentIndex) => currentIndex !== index),
  })),
  startSubmitting: () => set({ submitting: true, error: '' }),
  complete: (completedReturn) => set({ submitting: false, completedReturn }),
  reset: () => set({ ...initialState, refunds: [initialRefund()] }),
}));

export default useSaleReturnRuntimeStore;
