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

let customerDepositContextRequestSequence = 0;

const beginCustomerDepositContextRequest = () => ++customerDepositContextRequestSequence;
const ownsCustomerDepositContextRequest = (requestId) => customerDepositContextRequestSequence === requestId;
const invalidateCustomerDepositContextRequests = () => {
  customerDepositContextRequestSequence += 1;
};

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

  setCustomerDepositAmount: (amount) => {
    invalidateCustomerDepositContextRequests();
    set({ customerDepositAmount: amount });
  },
  setDepositUsed: (value) => set({ depositUsed: value }),
  setSelectedDeposit: (deposit) => {
    invalidateCustomerDepositContextRequests();
    set({ selectedDeposit: deposit });
  },
  setSelectedCustomer: (customer) => {
    invalidateCustomerDepositContextRequests();
    set({ selectedCustomer: customer });
  },
  setDeposits: (list) => set({ deposits: list }),
  clearSelectedDeposit: () => {
    invalidateCustomerDepositContextRequests();
    set({ selectedDeposit: null });
  },
  clearCustomer: () => {
    invalidateCustomerDepositContextRequests();
    set({
      selectedCustomer: null,
      selectedDeposit: null,
      customerDeposits: [],
      customerDepositAmount: 0,
      depositUsed: 0,
    });
  },
  clearCustomerDeposit: () => {
    invalidateCustomerDepositContextRequests();
    set({ selectedDeposit: null, customerDeposits: [], customerDepositAmount: 0, depositUsed: 0 });
  },

  clearCustomerAndDeposit: () => {
    invalidateCustomerDepositContextRequests();
    set({
      selectedCustomer: null,
      selectedDeposit: null,
      customerDeposits: [],
      customerDepositAmount: 0,
      depositUsed: 0,
    });
  },

  createCustomerDepositAction: async (data) => {
    if (get().isSubmitting) {
      throw new Error('กำลังบันทึกเงินมัดจำอยู่ กรุณารอสักครู่');
    }
    invalidateCustomerDepositContextRequests();
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
    const requestId = beginCustomerDepositContextRequest();
    const depositIdSnapshot = Number(id);
    set({ isLoadingDetail: true });
    try {
      const data = await getCustomerDepositById(depositIdSnapshot);
      if (!ownsCustomerDepositContextRequest(requestId)) return null;
      set({ selectedDeposit: data });
      return data;
    } catch (err) {
      if (!ownsCustomerDepositContextRequest(requestId)) return null;
      console.error('❌ fetchCustomerDepositByIdAction error:', err);
      set({ error: err });
      return null;
    } finally {
      if (ownsCustomerDepositContextRequest(requestId)) set({ isLoadingDetail: false });
    }
  },

  updateCustomerDepositAction: async (id, data) => {
    if (get().isSubmitting) {
      throw new Error('กำลังบันทึกเงินมัดจำอยู่ กรุณารอสักครู่');
    }
    invalidateCustomerDepositContextRequests();
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
    invalidateCustomerDepositContextRequests();
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
    if (get().isSubmitting) return 0;
    const requestId = beginCustomerDepositContextRequest();
    const customerIdSnapshot = Number(customerId);
    try {
      const res = await getCustomerDepositTotal(customerIdSnapshot);
      if (!ownsCustomerDepositContextRequest(requestId)) return 0;
      const amount = res?.amount || 0;
      set({ customerDepositAmount: amount });
      return amount;
    } catch (err) {
      if (!ownsCustomerDepositContextRequest(requestId)) return 0;
      console.error('❌ fetchCustomerDepositAction error:', err);
      set({ error: err });
      return 0;
    }
  },

  searchCustomerByPhoneAndDepositAction: async (phone) => {
    if (get().isSubmitting) return null;
    const requestId = beginCustomerDepositContextRequest();
    const phoneSnapshot = String(phone || '').trim();
    try {
      set({ error: null });
      const res = await getCustomerAndDepositByPhone(phoneSnapshot);
      if (!ownsCustomerDepositContextRequest(requestId)) return null;
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
      if (!ownsCustomerDepositContextRequest(requestId)) return null;
      console.error('❌ searchCustomerByPhoneAndDepositAction error:', err);
      set({ error: err });
      return null;
    }
  },

  searchCustomerByNameAndDepositAction: async (name) => {
    if (get().isSubmitting) return null;
    const requestId = beginCustomerDepositContextRequest();
    const nameSnapshot = String(name || '').trim();
    try {
      set({ error: null });
      const res = await getCustomerAndDepositByName(nameSnapshot);
      if (!ownsCustomerDepositContextRequest(requestId)) return null;
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
        query: res?.query || nameSnapshot,
        count: res?.count || results.length,
        results,
      };
    } catch (err) {
      if (!ownsCustomerDepositContextRequest(requestId)) return null;
      console.error('❌ searchCustomerByNameAndDepositAction error:', err);
      set({ error: err });
      return { query: nameSnapshot, count: 0, results: [] };
    }
  },

  searchCustomerByCustomerIdAndDepositAction: async (customerId) => {
    if (get().isSubmitting) return null;
    const requestId = beginCustomerDepositContextRequest();
    const customerIdSnapshot = Number(customerId);
    try {
      set({ error: null });
      const res = await getCustomerAndDepositByCustomerId(customerIdSnapshot);
      if (!ownsCustomerDepositContextRequest(requestId)) return null;
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
      if (!ownsCustomerDepositContextRequest(requestId)) return null;
      console.error('❌ searchCustomerByCustomerIdAndDepositAction error:', err);
      set({ error: err });
      return null;
    }
  },

  applyDepositUsageAction: async ({ depositId, saleId, amountUsed }) => {
    if (get().isSubmitting) {
      throw new Error('กำลังบันทึกเงินมัดจำอยู่ กรุณารอสักครู่');
    }
    invalidateCustomerDepositContextRequests();
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
    if (get().isSubmitting) return null;
    const requestId = beginCustomerDepositContextRequest();
    const phoneSnapshot = String(phone || '').trim();
    try {
      set({ error: null });
      const res = await getCustomerAndDepositByPhone(phoneSnapshot);
      if (!ownsCustomerDepositContextRequest(requestId)) return null;
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
      return { customer, totalDeposit: deposit, deposits };
    } catch (err) {
      if (!ownsCustomerDepositContextRequest(requestId)) return null;
      console.error('❌ loadCustomerDepositByPhoneAction error:', err);
      set({ error: err });
      return null;
    }
  },

  resetAllDepositState: () => {
    invalidateCustomerDepositContextRequests();
    set({
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
    });
  },
}));

export default useCustomerDepositStore;
