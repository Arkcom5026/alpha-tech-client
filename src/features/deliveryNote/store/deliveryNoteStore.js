// ✅ deliveryNoteStore.js

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import {
  searchPrintablePayments,
  updateSaleDocumentDescriptions,
} from '../api/deliveryNoteApi';

const useDeliveryNoteStore = create(
  devtools((set) => ({
    printablePayments: [],

    loadPrintablePaymentsAction: async (query = {}) => {
      try {
        const data = await searchPrintablePayments(query);

        set({
          printablePayments: data,
        });
      } catch (err) {
        console.error('❌ โหลด printablePayments ล้มเหลว:', err);
      }
    },

    updateSaleDocumentDescriptionsAction: async (
      saleId,
      payload
    ) => {
      try {
        const result = await updateSaleDocumentDescriptions(
          saleId,
          payload
        );

        return result;
      } catch (err) {
        console.error(
          '❌ updateSaleDocumentDescriptionsAction error:',
          err
        );

        throw err;
      }
    },
  }))
);

export default useDeliveryNoteStore;