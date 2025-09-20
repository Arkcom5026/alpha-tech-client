// productOnlineStore.jsx (Plan A: Performance)
// - Debounce dropdown fetch 700ms / search 800ms
// - Result cache 30s ตามคีย์ของตัวกรอง + หน้า
// - Pagination: page=1,size=18, fields='card' เพื่อลด payload
// - Reset paging เมื่อเปลี่ยนตัวกรอง (Minimal Disruption)

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import {
  getProductsForOnline,
  getProductOnlineById,
} from '@/features/online/productOnline/api/productOnlineApi';

import { useBranchStore } from '@/features/branch/store/branchStore';
import useProductStore from '@/features/product/store/productStore';

const initialFilters = {
  branchId: undefined,
  categoryId: undefined,
  productTypeId: undefined,
  productProfileId: undefined,
  productTemplateId: undefined,
  searchText: '',
};

const DEFAULT_PAGE = 1;
const DEFAULT_SIZE = 18;
const DEFAULT_FIELDS = 'card'; // BE ควร select เฉพาะฟิลด์ที่การ์ดใช้
const CACHE_TTL_MS = 30_000; // 30 วินาที
// Frontend env flag (Vite): แทนที่ process.env.NODE_ENV เพื่อลด no-undef
const IS_DEV = typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.DEV || import.meta.env.MODE !== 'production');

export const useProductOnlineStore = create(
  devtools((set, get) => ({
    // ========== State ==========
    products: [],
    total: 0,
    page: DEFAULT_PAGE,
    size: DEFAULT_SIZE,
    fields: DEFAULT_FIELDS,

    selectedProduct: null,
    isLoading: false,
    error: null,

    filters: { ...initialFilters },

    // ====== Internal (debounce/seq/cache) ======
    _reqSeq: 0,
    _fetchTimer: null,
    _resultCache: new Map(), // key -> { at, items, total }

    // ========== Pagination ==========
    setPageAction: (page) => set({ page: Number(page) || DEFAULT_PAGE }),
    setSizeAction: (size) => {
      const s = Number(size) || DEFAULT_SIZE;
      set({ size: s });
      get().resetPagingAction();
      // reload ด้วยขนาดใหม่ทันที
      get().loadProductsAction({ page: 1, size: s });
    },
    nextPageAction: () => set({ page: get().page + 1 }),
    resetPagingAction: () => set({ page: DEFAULT_PAGE }),

    // ========== Filters ==========
    setBranchIdAction: (branchId) => {
      set((state) => ({ filters: { ...state.filters, branchId } }));
      get().resetPagingAction();
      get()._debounceFetch(700);
    },

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
      if (JSON.stringify(curr) !== JSON.stringify(next)) {
        set({ filters: next });
        get().resetPagingAction();
        get()._debounceFetch(700);
      }
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

      if (JSON.stringify(curr) !== JSON.stringify(next)) {
        set({ filters: next });
        get().resetPagingAction();
        get()._debounceFetch(700);
      }
    },

    // ✅ รับค่าแบบ internal (number/undefined) เฉพาะบางคีย์ แล้วทำ cascade reset ตามความเปลี่ยนแปลง
    setFiltersAction: (partial = {}) => {
      const toNum = (v) => (v === '' || v === null || v === undefined ? undefined : Number(v));
      const curr = get().filters;
      const next = { ...curr };

      const has = (k) => Object.prototype.hasOwnProperty.call(partial, k);
      const nCat = has('categoryId') ? toNum(partial.categoryId) : curr.categoryId;
      const nType = has('productTypeId') ? toNum(partial.productTypeId) : curr.productTypeId;
      const nProf = has('productProfileId') ? toNum(partial.productProfileId) : curr.productProfileId;
      const nTemp = has('productTemplateId') ? toNum(partial.productTemplateId) : curr.productTemplateId;
      const nBranch = has('branchId') ? toNum(partial.branchId) : curr.branchId;

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

      if (JSON.stringify(curr) !== JSON.stringify(next)) {
        set({ filters: next });
        get().resetPagingAction();
        get()._debounceFetch(700);
      }
    },

    setFilters: (a, b) => {
      // รองรับทั้งรูปแบบ onChange(key,value) และ onChange(partial)
      if (a && typeof a === 'object' && !Array.isArray(a)) {
        return get().setFiltersAction(a);
      }
      return get().setFilterAction(a, b);
    },

    resetFilters: () => get().resetFiltersAction(),

    // ✅ อัปเดตเฉพาะ searchText (ดีบาวน์ยาวขึ้น)
    setSearchTextAction: (text = '') => {
      set((state) => ({ filters: { ...state.filters, searchText: String(text) } }));
      get().resetPagingAction();
      get()._debounceFetch(800);
    },

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

    resetFiltersAction: () => {
      set({ filters: { ...initialFilters, branchId: get().filters.branchId } });
      get().resetPagingAction();
      get()._debounceFetch(0);
    },

    // ========== Fetching ==========
    clearDebounceAction: () => {
      const t = get()._fetchTimer;
      if (t) clearTimeout(t);
      set({ _fetchTimer: null });
    },

    _debounceFetch: (delay = 700) => {
      const t = get()._fetchTimer;
      if (t) clearTimeout(t);
      const timer = setTimeout(() => get().loadProductsAction(), delay);
      set({ _fetchTimer: timer });
    },

    _makeCacheKey: (filters, page, size, fields) => {
      const keyObj = {
        b: filters.branchId || null,
        c: filters.categoryId || null,
        t: filters.productTypeId || null,
        p: filters.productProfileId || null,
        m: filters.productTemplateId || null,
        q: (filters.searchText || '').trim() || null,
        pg: page,
        sz: size,
        f: fields,
      };
      return JSON.stringify(keyObj);
    },

    _readCache: (key) => {
      const rec = get()._resultCache.get(key);
      if (!rec) return null;
      if (Date.now() - rec.at > CACHE_TTL_MS) return null;
      return rec;
    },

    _writeCache: (key, items, total) => {
      get()._resultCache.set(key, { at: Date.now(), items, total });
    },

    loadProductsAction: async (opts = {}) => {
      const s = get();
      const selectedBranchId = useBranchStore.getState().selectedBranchId;
      const filters = { ...s.filters, ...(opts.filters || {}), branchId: (opts.branchId ?? s.filters.branchId ?? selectedBranchId) };
      if (!filters.branchId) {
        console.warn('⚠️ [loadProductsAction] missing branchId');
        return;
      }

      const page = (opts.page ?? s.page ?? DEFAULT_PAGE);
      const size = (opts.size ?? s.size ?? DEFAULT_SIZE);
      const fields = (opts.fields ?? s.fields ?? DEFAULT_FIELDS);

      const key = get()._makeCacheKey(filters, page, size, fields);
      const cached = get()._readCache(key);
      if (cached) {
        set({ products: cached.items, total: cached.total, isLoading: false });
        return; // ใช้แคช
      }

      const mySeq = get()._reqSeq + 1;
      set({ _reqSeq: mySeq, isLoading: true, error: null });
      try {
        const params = { ...filters, page, size, fields };
        if (IS_DEV) { console.log('[ONLINE] loadProductsAction params', params); }
        const data = await getProductsForOnline(params);
        const items = data?.items || data || [];
        const total = data?.total ?? items.length;
        get()._writeCache(key, items, total);
        if (get()._reqSeq === mySeq) {
          set({ products: items, total, isLoading: false });
        }
      } catch (err) {
        console.error('❌ โหลดสินค้าออนไลน์ล้มเหลว:', err);
        if (get()._reqSeq === mySeq) {
          set({ error: 'ไม่สามารถโหลดสินค้าออนไลน์ได้', isLoading: false });
        }
      }
    },

    // เรียกตอนหน้า Shop mount → บังคับโหลด dropdowns หากยังว่าง (กันเคสหลัง Deploy)
    initOnlineShopAction: async () => {
      const productStore = useProductStore.getState();
      const dd = productStore.dropdowns || {};
      const hasData = Boolean(
        (dd.categories?.length || 0) > 0 ||
        (dd.productTypes?.length || 0) > 0 ||
        (dd.productProfiles?.length || 0) > 0 ||
        (dd.productTemplates?.length || 0) > 0,
      );
      if (!hasData || !productStore.dropdownsLoaded) {
        await productStore.fetchDropdownsAction?.(true); // force=true เคสหลัง deploy
      }
      set({ page: DEFAULT_PAGE, size: DEFAULT_SIZE });
      await get().loadProductsAction({ page: DEFAULT_PAGE, size: DEFAULT_SIZE });
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
    searchProductsAction: async (extra = {}) => {
      const selectedBranchId = useBranchStore.getState().selectedBranchId;
      const mergedFilters = { ...get().filters, ...extra, branchId: extra.branchId || selectedBranchId };
      const page = extra.page || get().page || DEFAULT_PAGE;
      const size = extra.size || get().size || DEFAULT_SIZE;
      const fields = extra.fields || get().fields || DEFAULT_FIELDS;

      const key = get()._makeCacheKey(mergedFilters, page, size, fields);
      const cached = get()._readCache(key);
      if (cached) {
        set({ products: cached.items, total: cached.total, isLoading: false });
        return;
      }

      const mySeq = get()._reqSeq + 1;
      set({ _reqSeq: mySeq, isLoading: true, error: null });
      try {
        const params = { ...mergedFilters, page, size, fields };
        const data = await getProductsForOnline(params);
        const items = data?.items || data || [];
        const total = data?.total ?? items.length;
        get()._writeCache(key, items, total);
        if (get()._reqSeq === mySeq) {
          set({ products: items, total, isLoading: false });
        }
      } catch (err) {
        console.error('❌ ค้นหาสินค้าออนไลน์ล้มเหลว:', err);
        if (get()._reqSeq === mySeq) {
          set({ error: 'ไม่สามารถค้นหาสินค้าได้', isLoading: false });
        }
      }
    },

    // ========== Utils ==========
    clearProductsAction: () => set({ products: [] }),
    clearSelectedProductAction: () => set({ selectedProduct: null }),

    clearProductCacheAction: () => {
      get()._resultCache = new Map();
    },
  })),
);

