// ✅ src/features/customer/store/customerStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const useCustomerStore = create(
  persist(
    (set, get) => ({
      customer: null,
      token: null,
      isLoggedIn: false,
      isCustomerLoaded: false,

      setCustomer: (data) => set({ customer: data, isLoggedIn: true, isCustomerLoaded: true }),
      setToken: (token) => set({ token }),

      logoutCustomer: () => {
        sessionStorage.removeItem('customer-storage');
        set({ customer: null, token: null, isLoggedIn: false, isCustomerLoaded: true });
      },

      
      actionLoginCustomer: async (form) => {
        try {
          const res = await axios.post('http://localhost:5000/api/loginUser', form, {
            headers: {
              'Content-Type': 'application/json',
            },
          });

          set({
            customer: res.data.payload,
            token: res.data.token,
            isLoggedIn: true,
            isCustomerLoaded: true,
          });

          return res;
        } catch (err) {
          console.error('Login Action Error:', err.response?.data);
          throw err;
        }
      },

      actionFetchCurrentCustomer: async () => {
        const token = get().token;
        if (!token) return;
          
        try {
          const res = await axios.get('http://localhost:5000/api/current-user', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          set({
            customer: res.data,
            isLoggedIn: true,
            isCustomerLoaded: true,
          });
        } catch (err) {
          console.error('Fetch Current Customer Error:', err.response?.data);
          get().logoutCustomer();
        }
      },
    }),
    {
      name: 'customer-storage',
      storage: sessionStorage,
      partialize: (state) => ({
        token: state.token,
        customer: state.customer,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);

export default useCustomerStore;
