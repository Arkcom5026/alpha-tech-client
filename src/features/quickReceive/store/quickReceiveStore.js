// src/features/quickReceive/store/quickReceiveStore.js
// Isolated Zustand store for Quick Receive / QuickStock runtime.
// Product Create/Product Management must not depend on this store.

import { create } from 'zustand';
import {
  getQuickReceiveDropdowns,
  quickStockIntakeExistingApi,
} from '@/features/quickReceive/api/quickReceiveApi';
import {
  createQuickReceiveLocalOperationalProduct,
  createQuickReceiveOperationalProductFromTemplate,
  getQuickReceiveOperationalProductByTemplateId,
  getQuickReceiveOperationalProducts,
  getQuickReceiveTemplateProducts,
} from '@/features/quickReceive/api/quickReceiveProductApi';
import { updateProduct, deleteProduct as deleteProductApi } from '@/features/product/api/productApi';

const initialDropdowns = {
  productTypes: [],
  brands: [],
  units: [],
};

const toFiniteNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const normalizeName = (value) => String(value ?? '').replace(/\s+/g, ' ').trim().toLowerCase();

const dedupeOptions = (items = []) => {
  const seen = new Set();
  const result = [];

  for (const item of Array.isArray(items) ? items : []) {
    const id = toFiniteNumber(item?.id);
    const name = String(item?.name ?? '').trim();
    const key = normalizeName(name);
    if (!id || !name || !key || seen.has(key)) continue;
    seen.add(key);
    result.push({ ...item, id, name });
  }

  return result.sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'th'));
};

const extractList = (raw) => {
  if (Array.isArray(raw)) return raw;
  const payload = raw?.data ?? raw;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.products)) return payload.products;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const extractSingle = (raw) => {
  if (!raw) return null;
  if (Array.isArray(raw)) return raw[0] || null;
  return raw?.product || raw?.data?.product || raw?.data?.item || raw?.data || raw?.result?.product || raw?.result?.item || raw?.result || raw?.item || null;
};

const normalizeError = (err, fallbackMessage = 'เกิดข้อผิดพลาด') => ({
  code: err?.code || err?.error || err?.data?.error || err?.response?.data?.error,
  message:
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    (typeof err === 'string' ? err : '') ||
    fallbackMessage,
  raw: err,
});

const useQuickReceiveStore = create((set, get) => ({
  dropdowns: initialDropdowns,
  dropdownsLoading: false,
  dropdownsLoaded: false,

  isLoading: false,
  error: null,

  operationalProducts: [],
  templateProducts: [],
  searchProducts: [],

  quickReceiveLoading: false,
  quickReceiveError: null,
  quickReceiveResult: null,

  normalizeError,

  loadDropdownsAction: async ({ productTypeId } = {}) => {
    set({ dropdownsLoading: true, error: null });
    try {
      const raw = await getQuickReceiveDropdowns({ productTypeId });
      const dropdowns = {
        productTypes: dedupeOptions(raw?.productTypes || []),
        brands: dedupeOptions(raw?.brands || []),
        units: dedupeOptions(raw?.units || []),
      };
      set({ dropdowns, dropdownsLoaded: true, dropdownsLoading: false });
      return dropdowns;
    } catch (error) {
      const mapped = normalizeError(error, 'โหลด Quick Receive Dropdown ไม่สำเร็จ');
      set({ error: mapped, dropdownsLoading: false, dropdownsLoaded: false });
      return get().dropdowns;
    }
  },

  resetDropdownsAction: () => set({ dropdowns: initialDropdowns, dropdownsLoaded: false, dropdownsLoading: false }),

  searchOperationalProductsAction: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const raw = await getQuickReceiveOperationalProducts(filters);
      const list = extractList(raw);
      set({ operationalProducts: list, isLoading: false });
      return list;
    } catch (error) {
      const mapped = normalizeError(error, 'ค้นหา Operational Product ไม่สำเร็จ');
      set({ error: mapped, isLoading: false });
      return [];
    }
  },

  searchTemplateProductsAction: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const raw = await getQuickReceiveTemplateProducts(filters);
      const list = extractList(raw);
      set({ templateProducts: list, isLoading: false });
      return list;
    } catch (error) {
      const mapped = normalizeError(error, 'ค้นหา Template Product ไม่สำเร็จ');
      set({ error: mapped, isLoading: false });
      return [];
    }
  },

  searchProductsAction: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const [operationalResult, templateResult] = await Promise.allSettled([
        getQuickReceiveOperationalProducts(filters),
        getQuickReceiveTemplateProducts(filters),
      ]);

      const operationalProducts = operationalResult.status === 'fulfilled' ? extractList(operationalResult.value) : [];
      const templateProducts = templateResult.status === 'fulfilled' ? extractList(templateResult.value) : [];
      const searchProducts = [...operationalProducts, ...templateProducts];

      set({ operationalProducts, templateProducts, searchProducts, isLoading: false });
      return { operationalProducts, templateProducts, searchProducts };
    } catch (error) {
      const mapped = normalizeError(error, 'ค้นหาสินค้าสำหรับ Quick Receive ไม่สำเร็จ');
      set({ error: mapped, isLoading: false });
      return { operationalProducts: [], templateProducts: [], searchProducts: [] };
    }
  },

  getOperationalProductByTemplateIdAction: async (templateProductId) => {
    const raw = await getQuickReceiveOperationalProductByTemplateId(templateProductId);
    return extractSingle(raw);
  },

  createOperationalProductFromTemplateAction: async (payload) => {
    set({ quickReceiveLoading: true, quickReceiveError: null });
    try {
      const response = await createQuickReceiveOperationalProductFromTemplate(payload);
      set({ quickReceiveLoading: false, quickReceiveResult: response?.data ?? response });
      return response;
    } catch (error) {
      const mapped = normalizeError(error, 'สร้าง Operational Product จาก Template ไม่สำเร็จ');
      set({ quickReceiveLoading: false, quickReceiveError: mapped });
      throw error;
    }
  },

  createLocalOperationalProductAction: async (payload) => {
    set({ quickReceiveLoading: true, quickReceiveError: null });
    try {
      const response = await createQuickReceiveLocalOperationalProduct(payload);
      set({ quickReceiveLoading: false, quickReceiveResult: response?.data ?? response });
      return response;
    } catch (error) {
      const mapped = normalizeError(error, 'สร้างสินค้า Local ไม่สำเร็จ');
      set({ quickReceiveLoading: false, quickReceiveError: mapped });
      throw error;
    }
  },

  updateOperationalProductAction: async (id, payload) => {
    set({ quickReceiveLoading: true, quickReceiveError: null });
    try {
      const response = await updateProduct(id, payload);
      set({ quickReceiveLoading: false, quickReceiveResult: response?.data ?? response });
      return response;
    } catch (error) {
      const mapped = normalizeError(error, 'บันทึกข้อมูลสินค้าไม่สำเร็จ');
      set({ quickReceiveLoading: false, quickReceiveError: mapped });
      throw error;
    }
  },

  deleteOperationalProductAction: async (id) => {
    set({ quickReceiveLoading: true, quickReceiveError: null });
    try {
      const response = await deleteProductApi(id);
      set({ quickReceiveLoading: false, quickReceiveResult: response?.data ?? response });
      return true;
    } catch (error) {
      const mapped = normalizeError(error, 'ลบสินค้าไม่สำเร็จ');
      set({ quickReceiveLoading: false, quickReceiveError: mapped });
      return false;
    }
  },

  quickReceiveExistingProductAction: async (payload) => {
    set({ quickReceiveLoading: true, quickReceiveError: null });
    try {
      const response = await quickStockIntakeExistingApi(payload);
      set({ quickReceiveLoading: false, quickReceiveResult: response?.data ?? response });
      return response;
    } catch (error) {
      const mapped = normalizeError(error, 'รับสินค้าเข้าจาก Product เดิมล้มเหลว');
      set({ quickReceiveLoading: false, quickReceiveError: mapped });
      throw error;
    }
  },

  quickStockIntakeExistingAction: async (payload) => get().quickReceiveExistingProductAction(payload),

  resetQuickReceiveStateAction: () => set({
    isLoading: false,
    error: null,
    quickReceiveLoading: false,
    quickReceiveError: null,
    quickReceiveResult: null,
    operationalProducts: [],
    templateProducts: [],
    searchProducts: [],
  }),
}));

export default useQuickReceiveStore;
