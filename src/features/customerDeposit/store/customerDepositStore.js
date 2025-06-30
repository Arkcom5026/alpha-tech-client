// customerDepositStore.js

import { create } from 'zustand';
import {
  createCustomerDeposit,
  getCustomerAndDepositByPhone,
  getCustomerDepositById,
  getCustomerDeposits,
  getCustomerDepositTotal,
  updateCustomerDeposit
} from '../api/customerDepositApi';


const useCustomerDepositStore = create((set, get) => ({
  isSubmitting: false,
  isLoading: false,
  isLoadingDetail: false,
  error: null,
  deposits: [],
  selectedDeposit: null,
  selectedCustomer: null,
  customerDepositAmount: 0,

  setCustomerDepositAmount: (amount) => set({ customerDepositAmount: amount }),
  setSelectedDeposit: (deposit) => set({ selectedDeposit: deposit }),
  setDeposits: (list) => set({ deposits: list }),
  clearSelectedDeposit: () => set({ selectedDeposit: null }),

  // ACTION: Create
  createCustomerDepositAction: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      const res = await createCustomerDeposit(data);
      return res;
    } catch (err) {
      console.error('❌ createCustomerDepositAction error:', err);
      set({ error: err });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  // ACTION: Fetch All
  fetchCustomerDepositsAction: async () => {
    set({ isLoading: true });
    try {
      const data = await getCustomerDeposits({
        include: {
          customer: { select: { fullName: true } },
        },
        where: { status: 'ACTIVE' },
      });
      set({ deposits: data });
    } catch (err) {
      console.error('❌ fetchCustomerDepositsAction error:', err);
      set({ error: err });
    } finally {
      set({ isLoading: false });
    }
  },

  // ACTION: Fetch By ID
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

  // ACTION: Update
  updateCustomerDepositAction: async (id, data) => {
    try {
      return await updateCustomerDeposit(id, data);
    } catch (err) {
      console.error('❌ updateCustomerDepositAction error:', err);
      set({ error: err });
      throw err;
    }
  },

  // ACTION: Cancel
  cancelCustomerDepositAction: async (id) => {
    try {
      return await updateCustomerDeposit(id, { status: 'CANCELLED' });
    } catch (err) {
      console.error('❌ cancelCustomerDepositAction error:', err);
      set({ error: err });
      throw err;
    }
  },

  // ACTION: Fetch Total Amount
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

  // ACTION: Search by Phone
  searchCustomerByPhoneAndDepositAction: async (phone) => {
    try {
      const res = await getCustomerAndDepositByPhone(phone);
      const customer = res?.customer;
      const deposit = res?.totalDeposit || 0;
      if (customer) {
        set({
          selectedCustomer: customer,
          customerDepositAmount: deposit,
        });
        return customer;
      } else {
        throw new Error('ไม่พบลูกค้า');
      }
    } catch (err) {
      console.error('❌ searchCustomerByPhoneAndDepositAction error:', err);
      set({ error: err });
      return null;
    }
  },

}));

export default useCustomerDepositStore;
