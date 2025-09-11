
// 📁 FILE: features/payment/store/paymentStore.js

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { submitPayments,  searchPrintablePayments } from '../api/paymentApi';

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
    try {
      set({ isSubmitting: true, error: null });

      // ใช้เส้นทางเดียวกับ multi เพื่อให้ BE เข้าชุดเดียว (createPayments)
      const receivedAtISO = `${paymentData.receivedAt}T00:00:00+07:00`;
      const paymentItems = [{
        paymentMethod: paymentData.paymentMethod,
        amount: parseFloat(paymentData.amount),
        note: paymentData.note || '',
      }];

      await submitPayments({
        saleId: Number(saleId),
        note: paymentData.note || '',
        receivedAt: receivedAtISO,
        paymentItems,
      });

      set({ isSubmitting: false });
      get().resetPaymentForm();
      return true;
    } catch (err) {
      console.error('❌ Payment Error:', err);
      set({ isSubmitting: false, error: 'ไม่สามารถบันทึกการชำระเงินได้' });
    }
  },

  submitMultiPaymentAction: async ({ saleId, paymentList, note }) => {
    try {
      set({ isSubmitting: true, error: null });
      const filteredPayments = paymentList.filter(
        (p) => !isNaN(Number(p.amount)) && Number(p.amount) > 0
      );
      if (!filteredPayments.length) {
        set({ isSubmitting: false });
        return;
      }

      const paymentItems = filteredPayments.map((p) => ({
        paymentMethod: p.method,
        amount: parseFloat(p.amount),
        note: p.note || '',
        slipImage: p.slipImage || null,
        cardRef: p.cardRef || null,
        govImage: p.govImage || null,
        ...(p.method === 'DEPOSIT' && p.customerDepositId
          ? { customerDepositId: p.customerDepositId }
          : {}),
      }));

      // header-level receivedAt เพื่อให้บันทึกวันรับเงินตรงกับ UI
      const { paymentData } = get();
      const receivedAtISO = `${paymentData.receivedAt}T00:00:00+07:00`;

      const payload = {
        saleId: Number(saleId),
        note: note || '',
        receivedAt: receivedAtISO,
        paymentItems,
      };

      await submitPayments(payload);
      set({ isSubmitting: false });
      get().resetPaymentForm();
      return true;
    } catch (err) {
      console.error('❌ MultiPayment Error:', err);
      set({ isSubmitting: false, error: 'บันทึกการชำระเงินแบบหลายช่องทางล้มเหลว' });
    }
  },

  loadPrintablePaymentsAction: async (params = {}) => {
    try {
      const data = await searchPrintablePayments({
        fromDate: params.fromDate,
        toDate: params.toDate,
        keyword: params.keyword || '',
        limit: params.limit || 100,
        _ts: Date.now(),
      });
      set({ printablePayments: data });
    } catch (err) {
      console.error('❌ โหลด printablePayments ล้มเหลว:', err);
    }
  },
})))

export default usePaymentStore;


