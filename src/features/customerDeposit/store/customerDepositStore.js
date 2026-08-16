// src/features/customerDeposit/store/customerDepositStore.js

import { create } from 'zustand';
import {
  createCustomerDeposit,
  getCustomerAndDepositByPhone,
  getCustomerAndDepositByName,
  getCustomerAndDepositByCustomerId,
  getCustomerDepositById,
  getCustomerDeposits,
  getCustomerDepositTotal,
  updateCustomerDeposit,
  applyDepositUsage,
} from '../api/customerDepositApi';

const useCustomerDepositStore = create((set, get) => ({
  isSubmitting: false,
  isLoading: false,
  isLoadingDetail: false,
  error: null,
  deposits: [],
  selectedDeposit: null,
  selectedCustomer: null,
  customerDeposits: [],
  customerDepositAmount: 0,
  depositUsed: 0,

  setCustomerDepositAmount: (amount) => set({ customerDepositAmount: amount }),
  setDepositUsed: (value) => set({ depositUsed: value }),
  setSelectedDeposit: (deposit) => set({ selectedDeposit: deposit }),
  setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),
  setDeposits: (list) => set({ deposits: list }),
  clearSelectedDeposit: () => set({ selectedDeposit: null }),
  clearCustomer: () => set({
    selectedCustomer: null,
    selectedDeposit: null,
    customerDeposits: [],
    customerDepositAmount: 0,
    depositUsed: 0,
  }),
  clearCustomerDeposit: () => set({ selectedDeposit: null, customerDeposits: [], customerDepositAmount: 0, depositUsed: 0 }),

  clearCustomerAndDeposit: () => set({
    selectedCustomer: null,
    selectedDeposit: null,
    customerDeposits: [],
    customerDepositAmount: 0,
    depositUsed: 0,
  }),

  createCustomerDepositAction: async (data) => {
    if (get().isSubmitting) {
      throw new Error('กำลังบันทึกเงินมัดจำอยู่ กรุณารอสักครู่');
    }
    set({ isSubmitting: true, error: null });
    try {
      return await createCustomerDeposit(data);
    } catch (err) {
      console.error('❌ createCustomerDepositAction error:', err);
      set({ error: err });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  fetchCustomerDepositsAction: async () => {
    set({ isLoading: true });
    try {
      const data = await getCustomerDeposits();
      console.log('fetchCustomerDepositsAction data :', data);
      set({ deposits: data });
    } catch (err) {
      console.error('❌ fetchCustomerDepositsAction error:', err);
      set({ error: err });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCustomerDepositByIdAction: async (id) => {
    set({ isLoadingDetail: true });
    try {
      const data = await getCustomerDepositById(id);
      set({ selectedDeposit: data });
    } catch (err) {
      console.error('❌ fetchCustomerDepositByIdAction error:', err);
      set({ error: err });
    } finally {
      set({ isLoadingDetail: false });
    }
  },

  updateCustomerDepositAction: async (id, data) => {
    if (get().isSubmitting) {
      throw new Error('กำลังบันทึกเงินมัดจำอยู่ กรุณารอสักครู่');
    }
    set({ isSubmitting: true, error: null });
    try {
      return await updateCustomerDeposit(id, data);
    } catch (err) {
      console.error('❌ updateCustomerDepositAction error:', err);
      set({ error: err });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  cancelCustomerDepositAction: async (id) => {
    if (get().isSubmitting) {
      throw new Error('กำลังบันทึกเงินมัดจำอยู่ กรุณารอสักครู่');
    }
    set({ isSubmitting: true, error: null });
    try {
      return await updateCustomerDeposit(id, { status: 'CANCELLED' });
    } catch (err) {
      console.error('❌ cancelCustomerDepositAction error:', err);
      set({ error: err });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  fetchCustomerDepositAction: async (customerId) => {
    try {
      const res = await getCustomerDepositTotal(customerId);
      const amount = res?.amount || 0;
      set({ customerDepositAmount: amount });
      return amount;
    } catch (err) {
      console.error('❌ fetchCustomerDepositAction error:', err);
      set({ error: err });
      return 0;
    }
  },

  searchCustomerByPhoneAndDepositAction: async (phone) => {
    try {
      set({ error: null });
      const res = await getCustomerAndDepositByPhone(phone);
      const customer = res?.customer || null;
      const deposit = res?.totalDeposit || 0;
      const deposits = Array.isArray(res?.deposits) ? res.deposits : [];

      if (!customer) {
        set({
          selectedCustomer: null,
          selectedDeposit: null,
          customerDeposits: [],
          customerDepositAmount: 0,
          depositUsed: 0,
        });
        throw new Error('ไม่พบลูกค้า');
      }

      set({
        selectedCustomer: customer,
        customerDepositAmount: deposit,
        selectedDeposit: deposits.length > 0 ? deposits[0] : null,
        customerDeposits: deposits,
      });

      return { customer, totalDeposit: deposit, deposits };
    } catch (err) {
      console.error('❌ searchCustomerByPhoneAndDepositAction error:', err);
      set({ error: err });
      return null;
    }
  },

  searchCustomerByNameAndDepositAction: async (name) => {
    try {
      set({ error: null });
      const res = await getCustomerAndDepositByName(name);
      console.log('✅ res จาก getCustomerAndDepositByName', res);
      const results = Array.isArray(res?.results) ? res.results : [];

      set({
        selectedCustomer: null,
        selectedDeposit: null,
        customerDeposits: [],
        customerDepositAmount: 0,
        depositUsed: 0,
      });

      return {
        query: res?.query || name,
        count: res?.count || results.length,
        results,
      };
    } catch (err) {
      console.error('❌ searchCustomerByNameAndDepositAction error:', err);
      set({ error: err });
      return { query: name, count: 0, results: [] };
    }
  },

  searchCustomerByCustomerIdAndDepositAction: async (customerId) => {
    try {
      set({ error: null });
      const res = await getCustomerAndDepositByCustomerId(customerId);
      const customer = res?.customer || null;
      const deposit = res?.totalDeposit || 0;
      const deposits = Array.isArray(res?.deposits) ? res.deposits : [];

      if (!customer) throw new Error('ไม่พบลูกค้า');

      set({
        selectedCustomer: customer,
        customerDepositAmount: deposit,
        selectedDeposit: deposits.length > 0 ? deposits[0] : null,
        customerDeposits: deposits,
        depositUsed: 0,
      });

      return { customer, totalDeposit: deposit, deposits };
    } catch (err) {
      console.error('❌ searchCustomerByCustomerIdAndDepositAction error:', err);
      set({ error: err });
      return null;
    }
  },

  applyDepositUsageAction: async ({ depositId, saleId, amountUsed }) => {
    if (get().isSubmitting) {
      throw new Error('กำลังบันทึกเงินมัดจำอยู่ กรุณารอสักครู่');
    }
    set({ isSubmitting: true, error: null });
    try {
      const res = await applyDepositUsage({ depositId, saleId, amountUsed });

      set((state) => {
        const usedValue = Number(res?.usedAmount || 0);
        const remainingValue = Number(res?.remainingAmount || 0);
        const nextCustomerDeposits = state.customerDeposits.map((item) => (
          item.id === depositId
            ? {
                ...item,
                usedAmount: usedValue,
                remainingAmount: remainingValue,
                status: res?.status || item.status,
              }
            : item
        ));

        const nextSelectedDeposit = state.selectedDeposit?.id === depositId
          ? {
              ...state.selectedDeposit,
              usedAmount: usedValue,
              remainingAmount: remainingValue,
              status: res?.status || state.selectedDeposit.status,
            }
          : state.selectedDeposit;

        return {
          selectedDeposit: nextSelectedDeposit,
          customerDeposits: nextCustomerDeposits,
          customerDepositAmount: Math.max(0, Number(state.customerDepositAmount || 0) - Number(amountUsed || 0)),
          depositUsed: Number(state.depositUsed || 0) + Number(amountUsed || 0),
        };
      });

      return res;
    } catch (err) {
      console.error('❌ applyDepositUsageAction error:', err);
      set({ error: err });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  loadCustomerDepositByPhoneAction: async (phone) => {
    try {
      set({ error: null });
      const res = await getCustomerAndDepositByPhone(phone);
      const customer = res?.customer || null;
      const deposit = res?.totalDeposit || 0;
      const deposits = Array.isArray(res?.deposits) ? res.deposits : [];
      if (customer) {
        set({
          selectedCustomer: customer,
          customerDepositAmount: deposit,
          selectedDeposit: deposits.length > 0 ? deposits[0] : null,
          customerDeposits: deposits,
        });
      } else {
        set({
          selectedCustomer: null,
          selectedDeposit: null,
          customerDeposits: [],
          customerDepositAmount: 0,
        });
      }
    } catch (err) {
      console.error('❌ loadCustomerDepositByPhoneAction error:', err);
      set({ error: err });
    }
  },

  resetAllDepositState: () => set({
    isSubmitting: false,
    isLoading: false,
    isLoadingDetail: false,
    error: null,
    deposits: [],
    selectedDeposit: null,
    selectedCustomer: null,
    customerDeposits: [],
    customerDepositAmount: 0,
    depositUsed: 0,
  }),
}));

export default useCustomerDepositStore;
