// productOnlineStore.jsx

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import {
  getProductsForOnline,
  getProductOnlineById
} from '@/features/online/productOnline/api/productOnlineApi';

import { useBranchStore } from '@/features/branch/store/branchStore';

const initialFilters = {
  branchId: undefined,
  categoryId: undefined,
  productTypeId: undefined,
  productProfileId: undefined,
  productTemplateId: undefined,
  searchText: '',
};

export const useProductOnlineStore = create(devtools((set, get) => ({
  products: [],
  selectedProduct: null,
  isLoading: false,
  error: null,

  filters: { ...initialFilters },

  // ----- Filters -----
  setBranchIdAction: (branchId) => set((state) => ({ filters: { ...state.filters, branchId } })),

  setFilterAction: (key, value) => {
    const toNum = (v) => (v === undefined || v === null || v === '' ? undefined : Number(v));
    const curr = get().filters;
    const next = { ...curr };
    if (key === 'categoryId') {
      const nv = toNum(value);
      if (curr.categoryId !== nv) {
        next.categoryId = nv;
        next.productTypeId = undefined;
        next.productProfileId = undefined;
        next.productTemplateId = undefined;
      }
    } else if (key === 'productTypeId') {
      const nv = toNum(value);
      if (curr.productTypeId !== nv) {
        next.productTypeId = nv;
        next.productProfileId = undefined;
        next.productTemplateId = undefined;
      }
    } else if (key === 'productProfileId') {
      const nv = toNum(value);
      if (curr.productProfileId !== nv) {
        next.productProfileId = nv;
        next.productTemplateId = undefined;
      }
    } else if (key === 'productTemplateId') {
      next.productTemplateId = toNum(value);
    } else if (key === 'branchId') {
      next.branchId = toNum(value);
    } else if (key === 'searchText') {
      next.searchText = value ?? '';
    }
    if (JSON.stringify(curr) !== JSON.stringify(next)) set({ filters: next });
  },

  // ✅ รับค่าแบบ UI ('' หรือ number) ทั้งก้อน แล้วทำ cascade reset ให้อัตโนมัติ
  setFiltersUIAction: (ui = {}) => {
    const toNum = (v) => (v === '' || v === null || v === undefined ? undefined : Number(v));
    const curr = get().filters;
    const next = { ...curr };

    const nCat = toNum(ui.categoryId);
    const nType = toNum(ui.productTypeId);
    const nProf = toNum(ui.productProfileId);
    const nTemp = toNum(ui.productTemplateId);

    if (curr.categoryId !== nCat) {
      next.categoryId = nCat;
      next.productTypeId = undefined;
      next.productProfileId = undefined;
      next.productTemplateId = undefined;
    }
    if (next.productTypeId !== nType) {
      next.productTypeId = nType;
      next.productProfileId = undefined;
      next.productTemplateId = undefined;
    }
    if (next.productProfileId !== nProf) {
      next.productProfileId = nProf;
      next.productTemplateId = undefined;
    }
    if (next.productTemplateId !== nTemp) {
      next.productTemplateId = nTemp;
    }

    if (typeof ui.searchText === 'string' && ui.searchText !== curr.searchText) {
      next.searchText = ui.searchText;
    }

    if (JSON.stringify(curr) !== JSON.stringify(next)) set({ filters: next });
  },

  // ✅ รับค่าแบบ internal (number/undefined) เฉพาะบางคีย์ แล้วทำ cascade reset ตามความเปลี่ยนแปลง
  setFiltersAction: (partial = {}) => {
    const toNum = (v) => (v === '' || v === null || v === undefined ? undefined : Number(v));
    const curr = get().filters;
    const next = { ...curr };

    const nCat = Object.prototype.hasOwnProperty.call(partial, 'categoryId') ? toNum(partial.categoryId) : curr.categoryId;
    const nType = Object.prototype.hasOwnProperty.call(partial, 'productTypeId') ? toNum(partial.productTypeId) : curr.productTypeId;
    const nProf = Object.prototype.hasOwnProperty.call(partial, 'productProfileId') ? toNum(partial.productProfileId) : curr.productProfileId;
    const nTemp = Object.prototype.hasOwnProperty.call(partial, 'productTemplateId') ? toNum(partial.productTemplateId) : curr.productTemplateId;
    const nBranch = Object.prototype.hasOwnProperty.call(partial, 'branchId') ? toNum(partial.branchId) : curr.branchId;

    if (curr.categoryId !== nCat) {
      next.categoryId = nCat;
      next.productTypeId = undefined;
      next.productProfileId = undefined;
      next.productTemplateId = undefined;
    }
    if (curr.productTypeId !== nType) {
      next.productTypeId = nType;
      next.productProfileId = undefined;
      next.productTemplateId = undefined;
    }
    if (curr.productProfileId !== nProf) {
      next.productProfileId = nProf;
      next.productTemplateId = undefined;
    }
    if (curr.productTemplateId !== nTemp) {
      next.productTemplateId = nTemp;
    }
    if (curr.branchId !== nBranch) {
      next.branchId = nBranch;
    }
    if (typeof partial.searchText === 'string' && partial.searchText !== curr.searchText) {
      next.searchText = partial.searchText;
    }

    if (JSON.stringify(curr) !== JSON.stringify(next)) set({ filters: next });
  },

  setFilters: (a, b) => {
    // รองรับทั้งรูปแบบ onChange(key,value) และ onChange(partial)
    if (a && typeof a === 'object' && !Array.isArray(a)) {
      return get().setFiltersAction(a);
    }
    return get().setFilterAction(a, b);
  },
  resetFilters: () => get().resetFiltersAction(),

  // ✅ อัปเดตเฉพาะ searchText
  setSearchTextAction: (text = '') => set((state) => ({ filters: { ...state.filters, searchText: String(text) } })),

  // ✅ ดึง filters ในรูปแบบ UI ('' แทน undefined)
  getFiltersUI: () => {
    const f = get().filters;
    return {
      categoryId: f.categoryId ?? '',
      productTypeId: f.productTypeId ?? '',
      productProfileId: f.productProfileId ?? '',
      productTemplateId: f.productTemplateId ?? '',
      searchText: f.searchText ?? '',
    };
  },

  resetFiltersAction: () => set({ filters: { ...initialFilters, branchId: get().filters.branchId } }),

  // ----- Fetching -----
  _reqSeq: 0,
  _fetchTimer: null,
  clearDebounceAction: () => {
    const t = get()._fetchTimer;
    if (t) clearTimeout(t);
    set({ _fetchTimer: null });
  },
  _debounceFetch: (delay = 350) => {
    const t = get()._fetchTimer;
    if (t) clearTimeout(t);
    const timer = setTimeout(() => get().loadProductsAction(), delay);
    set({ _fetchTimer: timer });
  },

  loadProductsAction: async () => {
    const s = get();
    const selectedBranchId = useBranchStore.getState().selectedBranchId;
    const filters = { ...s.filters, branchId: s.filters.branchId || selectedBranchId };
    if (!filters.branchId) {
      console.warn('⚠️ [loadProductsAction] missing branchId');
      return;
    }
    const mySeq = get()._reqSeq + 1;
    set({ _reqSeq: mySeq, isLoading: true, error: null });
    try {
      const data = await getProductsForOnline(filters);
      if (get()._reqSeq === mySeq) {
        set({ products: data?.items || data || [], isLoading: false });
      }
    } catch (err) {
      console.error('❌ โหลดสินค้าออนไลน์ล้มเหลว:', err);
      if (get()._reqSeq === mySeq) {
        set({ error: 'ไม่สามารถโหลดสินค้าออนไลน์ได้', isLoading: false });
      }
    }
  },

  getProductByIdAction: async (id, branchId) => {
    const selectedBranchId = useBranchStore.getState().selectedBranchId;
    const finalBranchId = Number(branchId || selectedBranchId);
    if (!finalBranchId) {
      console.warn('❗ ไม่พบ branchId สำหรับ getProductByIdAction');
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const data = await getProductOnlineById(Number(id), { branchId: finalBranchId });
      set({ selectedProduct: data, isLoading: false });
    } catch (err) {
      console.error('❌ โหลดสินค้ารายการเดียวล้มเหลว:', err);
      set({ error: 'ไม่สามารถโหลดสินค้านี้ได้', isLoading: false });
    }
  },

  // คงไว้เพื่อ backward-compat: เรียกเหมือน loadProductsAction
  searchProductsAction: async (filters = {}) => {
    const selectedBranchId = useBranchStore.getState().selectedBranchId;
    const merged = { ...get().filters, ...filters, branchId: filters.branchId || selectedBranchId };
    const mySeq = get()._reqSeq + 1;
    set({ _reqSeq: mySeq, isLoading: true, error: null });
    try {
      const data = await getProductsForOnline(merged);
      if (get()._reqSeq === mySeq) {
        set({ products: data?.items || data || [], isLoading: false });
      }
    } catch (err) {
      console.error('❌ ค้นหาสินค้าออนไลน์ล้มเหลว:', err);
      if (get()._reqSeq === mySeq) {
        set({ error: 'ไม่สามารถค้นหาสินค้าได้', isLoading: false });
      }
    }
  },

  // ----- Utils -----
  clearProductsAction: () => set({ products: [] }),
  clearSelectedProductAction: () => set({ selectedProduct: null }),

  clearProductCacheAction: async () => {
    try {
      // clearOnlineProductCache ถูกลบออก (ไม่มีใน API แล้ว)
    } catch (err) {
      console.error('❌ ล้างแคชสินค้าล้มเหลว:', err);
    }
  },
})));

