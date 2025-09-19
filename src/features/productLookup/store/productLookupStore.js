

// src/features/productLookup/store/productLookupStore.js
// Frontend uses ES Modules; Store must be the only place that calls API modules
// Rules enforced: no API calls in components; actions must end with `Action`.
// BranchId is NOT sent from FE; BE resolves from JWT.

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import * as productLookupApi from '@/features/productLookup/api/productLookupApi';

const initialState = {
  results: [], // compact list for dropdown/table
  selected: null, // currently chosen product
  loading: false,
  error: null,
  lastQuery: '',
  requestSeq: 0, // for race-condition guard
  aborter: null, // AbortController for in-flight request
};

export const useProductLookupStore = create(
  devtools((set, get) => ({
    ...initialState,

    // Cancel in-flight request if exists
    _cancelInFlight() {
      const { aborter } = get();
      try {
        if (aborter) aborter.abort();
      } catch {
        // ignore
      }
      set({ aborter: null });
    },

    // Normalize product object for UI usage
    _normalize(product) {
      if (!product) return null;
      const unitCost = Number(product.unitCost ?? product.lastCost ?? product.purchaseCost ?? product.cost ?? 0) || 0;
      const sellPrice = Number(product.sellPrice ?? product.price ?? 0) || 0;
      return {
        id: product.id,
        name: product.name,
        model: product.model || '',
        sku: product.sku || product.code || '',
        barcode: product.barcode || '',
        qty: product.qty ?? product.stockQty ?? 0,
        unitCost,
        sellPrice,
        productTypeId: product.productTypeId ?? null,
        productTemplateId: product.productTemplateId ?? null,
        isSimple: Boolean(product.isSimple),
        raw: product,
      };
    },

    // Search products list (debounce upstream)
    async searchProductsAction({ query, limit = 20, noSN = true } = {}) {
      const q = (query || '').trim();
      if (q.length < 2) { set({ results: [], lastQuery: q }); return []; }
      const seq = get().requestSeq + 1;
      set({ loading: true, error: null, lastQuery: q, requestSeq: seq });

      get()._cancelInFlight();
      const aborter = new AbortController();
      set({ aborter });

      try {
        console.debug('[productLookupStore] searchProductsAction →', q);
        const res = await productLookupApi.searchProducts({ query: q, limit, noSN, signal: aborter.signal });
        if (get().requestSeq !== seq) return [];
        const rows = Array.isArray(res)
          ? res
          : Array.isArray(res?.items)
            ? res.items
            : Array.isArray(res?.rows)
              ? res.rows
              : Array.isArray(res?.data)
                ? res.data
                : [];
        const normalized = rows.map(get()._normalize).filter(Boolean);
        console.debug('[productLookupStore] results ←', normalized.length);
        set({ results: normalized, loading: false, error: null });
        return normalized;
      } catch (error) {
        if (error?.name === 'AbortError') return [];
        set({ loading: false, error: error instanceof Error ? error.message : 'Lookup failed' });
        return [];
      } finally {
        set({ aborter: null });
      }
    },

    // Lookup exact product by code (barcode or SKU)
    async lookupByCodeAction(code) {
      const value = (code || '').trim();
      if (!value) return null;

      const seq = get().requestSeq + 1;
      set({ loading: true, error: null, requestSeq: seq });

      get()._cancelInFlight();
      const aborter = new AbortController();
      set({ aborter });

      try {
        console.debug('[productLookupStore] lookupByCodeAction →', value);
        const res = await productLookupApi.lookupByCode({ code: value, signal: aborter.signal });
        if (get().requestSeq !== seq) return null;
        const data = res?.data || res;
        const product = Array.isArray(data) ? data[0] : data;
        const normalized = get()._normalize(product);

        if (normalized) {
          set((s) => ({
            results: [normalized, ...s.results.filter((r) => r.id !== normalized.id)],
            selected: normalized,
            loading: false,
            error: null,
          }));
          console.debug('[productLookupStore] lookup result ←', normalized);
        } else {
          set({ loading: false });
        }
        return normalized;
      } catch (error) {
        if (error?.name === 'AbortError') return null;
        set({ loading: false, error: error instanceof Error ? error.message : 'Lookup failed' });
        return null;
      } finally {
        set({ aborter: null });
      }
    },

    // Select product from UI
    selectProductAction(product) {
      const normalized = get()._normalize(product);
      set({ selected: normalized });
      return normalized;
    },

    // Clear current results
    clearResultsAction() {
      set({ results: [], lastQuery: '' });
    },

    // Reset entire store
    resetAction() {
      get()._cancelInFlight();
      set({ ...initialState });
    },
  }))
);

export default useProductLookupStore;

