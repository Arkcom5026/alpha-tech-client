// FE: src/features/quickReceive/store/quickReceiveStore.js
// Zustand store สำหรับ Quick Receive (Simple)

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  previewQuickReceive,
  createQuickReceive,
  makeIdempotencyKey,
} from '../api/quickReceiveApi.js';

const uid = () =>
  (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2));

// number helper to normalize empty string/null/undefined
const num = (v) => (v === '' || v == null ? 0 : Number(v) || 0);

const initialState = {
  supplierId: '',        // '' = ยังไม่เลือก, 0 = Walk-in (ถ้าอนุญาต)
  note: '',
  managerPin: '',
  items: [],             // [{ key, productId, name?, qty, unitCost, vatRate }]
  preview: null,         // { totals, warnings }
  loading: false,
  error: '',
  result: null,
};

export const useQuickReceiveStore = create(
  devtools((set, get) => ({
    ...initialState,

    // ===== Mutations =====
    resetAction: () => set({ ...initialState }),
    setSupplierAction: (supplierId) => set({ supplierId, preview: null, result: null, error: '' }),
    setNoteAction: (note) => set({ note }),
    setManagerPinAction: (v) => set({ managerPin: v }),

    addFromProductAction: (product) =>
      set((s) => {
        // product: { id, name?, costPrice?, defaultVatRate? }
        const idx = s.items.findIndex(
          (it) => Number(it.productId) === Number(product.id)
        );
        if (idx >= 0) {
          const copy = [...s.items];
          const current = copy[idx];
          const unitCost = num(product.costPrice ?? product.lastCost ?? current.unitCost ?? 0);
          copy[idx] = {
            ...current,
            qty: (Number(current.qty) || 0) + 1,
            unitCost,
          };
          return { items: copy, preview: null, result: null, error: '' };
        }
        return {
          items: [
            ...s.items,
            {
              key: uid(),
              productId: Number(product.id),
              name: product.name || '-',
              qty: 1,
              unitCost: num(product.costPrice ?? product.lastCost ?? 0),
              vatRate: product.defaultVatRate ?? product.vatRate ?? 7,
            },
          ],
        };
      }),

    addRowAction: () =>
      set((s) => ({
        items: [
          ...s.items,
          { key: uid(), productId: '', name: '', qty: 1, unitCost: 0, vatRate: 7 },
        ],
        preview: null,
        result: null,
        error: '',
      })),
    removeRowAction: (key) =>
      set((s) => ({ items: s.items.filter((it) => it.key !== key), preview: null, result: null, error: '' })),
    updateRowAction: (key, patch) =>
      set((s) => ({
        items: s.items.map((it) => (it.key === key ? { ...it, ...patch } : it)),
        preview: null,
        result: null,
        error: '',
      })),

    // ===== Derived helpers =====
    computeTotals: () => {
      const { items } = get();
      const lines = items
        .filter((x) => Number(x.productId) > 0 && Number(x.qty) > 0)
        .map((x) => {
          const line = (Number(x.qty) || 0) * (Number(x.unitCost) || 0);
          const vat = line * ((Number(x.vatRate) || 0) / 100);
          return { line, vat };
        });
      const subtotal = lines.reduce((a, b) => a + b.line, 0);
      const vat = lines.reduce((a, b) => a + b.vat, 0);
      const total = subtotal + vat;
      return { subtotal, vat, total };
    },

    // ===== Network actions =====
    runPreviewAction: async () => {
      const { supplierId, note, items } = get();
      const payloadItems = items
        .filter((x) => Number(x.productId) > 0 && Number(x.qty) > 0)
        .map((x) => ({
          productId: Number(x.productId),
          quantity: Number(x.qty),
          unitCost: Number(x.unitCost) || 0,
          vatRate: Number(x.vatRate) || 0,
        }));

      if (!supplierId) {
        set({ error: 'กรุณาเลือก Supplier ก่อนคำนวณ' });
        return null;
      }
      if (payloadItems.length === 0) {
        set({ error: 'กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ' });
        return null;
      }

      set({ loading: true, error: '' });
      try {
        const data = await previewQuickReceive({
          supplierId: Number(supplierId) || 0,
          note,
          items: payloadItems,
        });
        set({ preview: data, loading: false });
        return data;
      } catch (err) {
        set({
          error:
            err?.response?.data?.message ||
            err?.message ||
            'ไม่สามารถคำนวณได้',
          loading: false,
        });
        return null;
      }
    },

    submitAction: async () => {
      const { supplierId, note, items, managerPin } = get();
      const payloadItems = items
        .filter((x) => Number(x.productId) > 0 && Number(x.qty) > 0)
        .map((x) => ({
          productId: Number(x.productId),
          quantity: Number(x.qty),
          unitCost: Number(x.unitCost) || 0,
          vatRate: Number(x.vatRate) || 0,
        }));

      if (!supplierId) {
        set({ error: 'กรุณาเลือก Supplier ก่อนบันทึก' });
        return null;
      }
      if (payloadItems.length === 0) {
        set({ error: 'กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ' });
        return null;
      }

      set({ loading: true, error: '', result: null });
      try {
        const out = await createQuickReceive(
          {
            supplierId: Number(supplierId) || 0,
            note,
            items: payloadItems,
            managerPin,
          },
          { idempotencyKey: makeIdempotencyKey?.() || uid() }
        );
        set({ result: out, loading: false });
        return out;
      } catch (err) {
        set({
          error: err?.response?.data?.message || err?.message || 'เกิดข้อผิดพลาด',
          loading: false,
        });
        return null;
      }
    },
  }))
);

// ---- Selectors (optional) ----
export const selectItems = (s) => s.items;
export const selectLoading = (s) => s.loading;
export const selectError = (s) => s.error;
export const selectPreview = (s) => s.preview;
export const selectResult = (s) => s.result;

// ---- Global reset hook (clear stale state when page broadcasts reset) ----
if (typeof window !== 'undefined') {
  try {
    window.addEventListener('quick-receive:reset', () => {
      try { useQuickReceiveStore.getState().resetAction(); } catch { /* noop */ }
    });
  } catch { /* noop */ }
}

// convenient helper for imperative reset
export const resetQuickReceive = () => useQuickReceiveStore.getState().resetAction();


