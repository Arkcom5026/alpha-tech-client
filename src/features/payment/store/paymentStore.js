// 📁 FILE: features/payment/store/paymentStore.js

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { submitPayments, searchPrintablePayments } from '../api/paymentApi';

const normalizeReceivedAt = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return `${raw}T00:00:00+07:00`;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(raw)) return `${raw}:00+07:00`;
  return raw;
};

const usePaymentStore = create(devtools((set, get) => ({
  paymentData: {
    paymentMethod: '',
    amount: '',
    note: '',
    receivedAt: new Date().toISOString().slice(0, 10),
  },
  isSubmitting: false,
  loading: false,
  error: null,

  paymentList: [],
  printablePayments: [],
  isLoadingPrintablePayments: false,
  printablePaymentsError: null,

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

  clearErrorAction: () => set({ error: null }),

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
    if (get().isSubmitting) return null;
    const { paymentData } = get();
    try {
      set({ isSubmitting: true, loading: true, error: null });

      const paymentItems = [{
        paymentMethod: paymentData.paymentMethod,
        amount: parseFloat(paymentData.amount),
        note: paymentData.note || '',
      }];

      await submitPayments({
        saleId: Number(saleId),
        note: paymentData.note || '',
        receivedAt: normalizeReceivedAt(paymentData.receivedAt),
        paymentItems,
      });

      set({ isSubmitting: false, loading: false });
      get().resetPaymentForm();
      return true;
    } catch (err) {
      set({ isSubmitting: false, loading: false, error: err?.message || 'Payment failed' });
      throw err;
    }
  },

  submitMultiPaymentAction: async ({ saleId, paymentList, note, paymentData: callerPaymentData }) => {
    if (get().isSubmitting) return null;
    try {
      set({ isSubmitting: true, loading: true, error: null });
      const filteredPayments = paymentList.filter(
        (p) => !isNaN(Number(p.amount)) && Number(p.amount) > 0
      );
      if (!filteredPayments.length) {
        set({ isSubmitting: false, loading: false });
        return false;
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

      const storePaymentData = get().paymentData;
      const receivedAt = callerPaymentData?.receivedAt || storePaymentData.receivedAt;
      const paymentNote = note ?? callerPaymentData?.note ?? '';

      const payload = {
        saleId: Number(saleId),
        note: paymentNote,
        receivedAt: normalizeReceivedAt(receivedAt),
        paymentItems,
      };

      await submitPayments(payload);
      set({ isSubmitting: false, loading: false });
      get().resetPaymentForm();
      return true;
    } catch (err) {
      set({ isSubmitting: false, loading: false, error: err?.message || 'Multi-payment failed' });
      throw err;
    }
  },

  loadPrintablePaymentsAction: async (params = {}) => {
    try {
      set({ isLoadingPrintablePayments: true, printablePaymentsError: null });

      const limitSafe = Math.max(1, Number(params.limit || 100));

      const data = await searchPrintablePayments({
        fromDate: params.fromDate || undefined,
        toDate: params.toDate || undefined,
        keyword: params.keyword || '',
        limit: limitSafe,
        _ts: Date.now(),
      });

      const listSafe = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
          ? data.items
          : [];

      set({ printablePayments: listSafe, isLoadingPrintablePayments: false });
      return listSafe;
    } catch (err) {
      set({ isLoadingPrintablePayments: false, printablePaymentsError: 'โหลดรายการพิมพ์ย้อนหลังไม่สำเร็จ' });
      return [];
    }
  },
})))

export default usePaymentStore;
