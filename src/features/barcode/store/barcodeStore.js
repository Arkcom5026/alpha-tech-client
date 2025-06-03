// src/features/barcode/store/barcodeStore.js

import { create } from 'zustand';
import { generateMissingBarcodes, getBarcodesByReceiptId } from '../api/barcodeApi';

const useBarcodeStore = create((set) => ({
  barcodes: [],
  loading: false,
  error: null,

  loadBarcodesAction: async (receiptId) => {
    set({ loading: true, error: null });
    try {
      const data = await getBarcodesByReceiptId(receiptId);
      set({ barcodes: data.barcodes, loading: false });
    } catch (error) {
      console.error('❌ loadBarcodesAction', error);
      set({ error, loading: false });
    }
  },

  generateBarcodesAction: async (receiptId) => {
    set({ loading: true, error: null });
    try {
      const data = await generateMissingBarcodes(receiptId);
      set({ barcodes: data.barcodes, loading: false });
    } catch (error) {
      console.error('❌ generateBarcodesAction', error);
      set({ error, loading: false });
    }
  },

  clearBarcodes: () => set({ barcodes: [] }),
}));

export default useBarcodeStore;
