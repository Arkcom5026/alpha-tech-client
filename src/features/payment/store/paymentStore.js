import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { submitPayment, submitPayments, cancelPayment, searchPrintablePayments } from '../api/paymentApi';
import useSalesStore from '@/features/sales/store/salesStore';


import useEmployeeStore from '@/features/employee/store/employeeStore';
import { useBranchStore } from '@/features/branch/store/branchStore';


const usePaymentStore = create(devtools((set, get) => ({
  paymentData: {
    paymentMethod: '',
    amount: '',
    note: '',
    receivedAt: new Date().toISOString().slice(0, 10),
  },
  isSubmitting: false,
  error: null,

  paymentList: [],
  printablePayments: [],

  setPaymentField: (field, value) => {
    set((state) => ({
      paymentData: {
        ...state.paymentData,
        [field]: value,
      },
    }));
  },

  togglePaymentMethod: (method) => {
    const { paymentList } = get();
    const exists = paymentList.find((p) => p.method === method);
    if (exists) {
      set({ paymentList: paymentList.filter((p) => p.method !== method) });
    } else {
      set({ paymentList: [...paymentList, { method, amount: 0, note: '' }] });
    }
  },

  setPaymentAmount: (method, amount) => {
    const { paymentList } = get();
    set({
      paymentList: paymentList.map((p) =>
        p.method === method ? { ...p, amount: parseFloat(amount) || 0 } : p
      ),
    });
  },

  setPaymentNote: (method, note) => {
    const { paymentList } = get();
    set({
      paymentList: paymentList.map((p) =>
        p.method === method ? { ...p, note } : p
      ),
    });
  },

  sumPaymentList: () => {
    const { paymentList } = get();
    return paymentList.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  },

  resetPaymentForm: () => {
    set({
      paymentData: {
        paymentMethod: '',
        amount: '',
        note: '',
        receivedAt: new Date().toISOString().slice(0, 10),
      },
      paymentList: [],
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
    } catch (err) {
      console.error('❌ Payment Error:', err);
      set({ isSubmitting: false, error: 'ไม่สามารถบันทึกการชำระเงินได้' });
    }
  },

  submitMultiPaymentAction: async ({ saleId, netPaid, paymentList, note }) => {
    try {
      set({ isSubmitting: true, error: null });

      const filteredPayments = paymentList.filter(
        (p) => !isNaN(Number(p.amount)) && Number(p.amount) > 0
      );

      console.log('📦 paymentList ที่ถูกกรองแล้ว:', filteredPayments);

      if (!filteredPayments.length) {
        console.warn('⚠️ ไม่มีรายการชำระเงินที่มีจำนวนเงินที่มากกว่า 0');
        set({ isSubmitting: false });
        return;
      }

      const nonCashPaid = filteredPayments
        .filter(p => p.method !== 'CASH')
        .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

      const cashAmount = Math.max(netPaid - nonCashPaid, 0);

      const paymentItems = filteredPayments.map((p) => ({
        paymentMethod: p.method,
        amount: p.method === 'CASH' ? cashAmount : parseFloat(p.amount),
        note: p.note || '',
        slipImage: p.slipImage || null,
        cardRef: p.cardRef || null,
        govImage: p.govImage || null,
      }));

      const payload = {
        saleId: Number(saleId),
        note: note || '',
        paymentItems,
      };

      console.log('📤 ส่ง payload ไป createPayments:', payload);

      await submitPayments(payload);
      set({ isSubmitting: false });
      return true;
    } catch (err) {
      console.error('❌ MultiPayment Error:', err);
      set({ isSubmitting: false, error: 'บันทึกการชำระเงินแบบหลายช่องทางล้มเหลว' });
    }
  },

  loadPrintablePaymentsAction: async () => {
    try {
      const data = await searchPrintablePayments();
      set({ printablePayments: data });
    } catch (err) {
      console.error('❌ โหลด printablePayments ล้มเหลว:', err);
    }
  },
  
})))

export default usePaymentStore;
