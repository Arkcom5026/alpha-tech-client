import { create } from 'zustand';

import { searchSaleDocuments } from '../api/saleDocumentSearchApi';
import {
  normalizeSaleDocumentSearchRows,
  projectSaleDocumentSearchQuery,
  validateSaleDocumentSearchQuery,
} from '../services/saleDocumentSearchQuery';

const useSaleDocumentSearchStore = create((set, get) => ({
  rows: [],
  loading: false,
  error: null,
  lastQuery: null,
  lastSearchedAt: null,

  clearError: () => set({ error: null }),
  reset: () => set({
    rows: [],
    loading: false,
    error: null,
    lastQuery: null,
    lastSearchedAt: null,
  }),

  search: async ({ policy, ...input } = {}) => {
    const validation = validateSaleDocumentSearchQuery(input);
    if (!validation.ok) {
      set({ error: validation.error });
      return { ok: false, error: validation.error, rows: [] };
    }

    if (!policy?.isEligible || !policy?.projectRow) {
      const error = 'ไม่พบ Search Policy สำหรับเอกสารที่เลือก';
      set({ error });
      return { ok: false, error, rows: [] };
    }

    const query = projectSaleDocumentSearchQuery({ ...input, policy });
    set({ loading: true, error: null, lastQuery: query });

    try {
      const response = await searchSaleDocuments(query);
      const normalizedRows = normalizeSaleDocumentSearchRows(response);
      const rows = normalizedRows
        .filter((sale) => policy.isEligible(sale))
        .map((sale) => policy.projectRow(sale));

      const lastSearchedAt = new Date().toISOString();
      set({ rows, lastSearchedAt });
      return { ok: true, rows, query, lastSearchedAt };
    } catch (error) {
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        'ค้นหาเอกสารการขายไม่สำเร็จ';
      set({ rows: [], error: message });
      return { ok: false, error: message, rows: [] };
    } finally {
      set({ loading: false });
    }
  },

  getSnapshot: () => get(),
}));

export default useSaleDocumentSearchStore;
