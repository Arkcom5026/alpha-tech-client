import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { submitPayment } from '../api/paymentApi';


import useEmployeeStore from '@/store/employeeStore';
import useBranchStore from '@/store/branchStore';

const usePaymentStore = create(devtools((set, get) => ({
  paymentData: {
    paymentMethod: '',
    amount: '',
    note: '',
    receivedAt: new Date().toISOString().slice(0, 10),
  },
  isSubmitting: false,
  error: null,

  setPaymentField: (field, value) => {
    set((state) => ({
      paymentData: {
        ...state.paymentData,
        [field]: value,
      },
    }));
  },

  resetPaymentForm: () => {
    set({
      paymentData: {
        paymentMethod: '',
        amount: '',
        note: '',
        receivedAt: new Date().toISOString().slice(0, 10),
      },
      error: null,
    });
  },

  submitPaymentAction: async (saleId) => {
    const { paymentData } = get();
    const { employee } = useEmployeeStore.getState();
    const { branch } = useBranchStore.getState();

    try {
      set({ isSubmitting: true, error: null });

      const payload = {
        saleId,
        paymentMethod: paymentData.paymentMethod,
        amount: parseFloat(paymentData.amount),
        note: paymentData.note || '',
        receivedAt: new Date(paymentData.receivedAt),
        employeeProfileId: employee?.id,
        branchId: branch?.id,
      };

      await submitPayment(payload);
      set({ isSubmitting: false });
      // optional: redirect or show success here
    } catch (err) {
      console.error('❌ Payment Error:', err);
      set({ isSubmitting: false, error: 'ไม่สามารถบันทึกการชำระเงินได้' });
    }
  },
})));

export default usePaymentStore;
