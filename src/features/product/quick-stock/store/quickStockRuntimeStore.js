// src/features/product/quick-stock/store/quickStockRuntimeStore.js

import { create } from "zustand";

import {
  commitQuickStockExistingIntake,
  createQuickStockLocalOperationalProduct,
  createQuickStockOperationalProductFromTemplate,
  deleteQuickStockOperationalProduct,
  getQuickStockDropdowns,
  getQuickStockOperationalProductByTemplateId,
  normalizeQuickStockError,
  searchQuickStockProducts,
  updateQuickStockOperationalProduct,
} from "../api/quickStockApi";

const initialDropdowns = {
  productTypes: [],
  brands: [],
  units: [],
};

const toFiniteNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const normalizeName = (value) =>
  String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const dedupeOptions = (items = []) => {
  const seen = new Set();
  const result = [];

  for (const item of Array.isArray(items) ? items : []) {
    const id = toFiniteNumber(item?.id);
    const name = String(item?.name ?? "").trim();
    const key = normalizeName(name);

    if (!id || !name || !key || seen.has(key)) continue;

    seen.add(key);
    result.push({ ...item, id, name });
  }

  return result.sort((a, b) =>
    String(a.name || "").localeCompare(String(b.name || ""), "th")
  );
};

const useQuickStockRuntimeStore = create((set, get) => ({
  dropdowns: initialDropdowns,
  dropdownsLoading: false,
  dropdownsLoaded: false,

  isLoading: false,
  error: null,

  operationalProducts: [],
  templateProducts: [],
  searchProducts: [],

  quickStockLoading: false,
  quickStockError: null,
  quickStockResult: null,

  normalizeError: normalizeQuickStockError,

  loadDropdownsAction: async ({ productTypeId } = {}) => {
    set({ dropdownsLoading: true, error: null });

    try {
      const raw = await getQuickStockDropdowns({ productTypeId });
      const dropdowns = {
        productTypes: dedupeOptions(raw?.productTypes || []),
        brands: dedupeOptions(raw?.brands || []),
        units: dedupeOptions(raw?.units || []),
      };

      set({
        dropdowns,
        dropdownsLoaded: true,
        dropdownsLoading: false,
      });

      return dropdowns;
    } catch (error) {
      const mapped = normalizeQuickStockError(
        error,
        "โหลด QuickStock Dropdown ไม่สำเร็จ"
      );

      set({
        error: mapped,
        dropdownsLoading: false,
        dropdownsLoaded: false,
      });

      return get().dropdowns;
    }
  },

  resetDropdownsAction: () =>
    set({
      dropdowns: initialDropdowns,
      dropdownsLoaded: false,
      dropdownsLoading: false,
    }),

  searchProductsAction: async (filters = {}) => {
    set({ isLoading: true, error: null });

    try {
      const result = await searchQuickStockProducts(filters);
      const operationalProducts = Array.isArray(result?.operationalProducts)
        ? result.operationalProducts
        : [];
      const templateProducts = Array.isArray(result?.templateProducts)
        ? result.templateProducts
        : [];
      const searchProducts = Array.isArray(result?.searchProducts)
        ? result.searchProducts
        : [...operationalProducts, ...templateProducts];

      set({
        operationalProducts,
        templateProducts,
        searchProducts,
        isLoading: false,
      });

      return {
        operationalProducts,
        templateProducts,
        searchProducts,
      };
    } catch (error) {
      const mapped = normalizeQuickStockError(
        error,
        "ค้นหาสินค้าสำหรับ QuickStock ไม่สำเร็จ"
      );

      set({
        error: mapped,
        isLoading: false,
      });

      return {
        operationalProducts: [],
        templateProducts: [],
        searchProducts: [],
      };
    }
  },

  getOperationalProductByTemplateIdAction: async (templateProductId) => {
    return getQuickStockOperationalProductByTemplateId(templateProductId);
  },

  createOperationalProductFromTemplateAction: async (payload) => {
    set({ quickStockLoading: true, quickStockError: null });

    try {
      const response = await createQuickStockOperationalProductFromTemplate(payload);

      set({
        quickStockLoading: false,
        quickStockResult: response?.data ?? response,
      });

      return response;
    } catch (error) {
      const mapped = normalizeQuickStockError(
        error,
        "สร้าง Operational Product จาก Template ไม่สำเร็จ"
      );

      set({
        quickStockLoading: false,
        quickStockError: mapped,
      });

      throw error;
    }
  },

  createLocalOperationalProductAction: async (payload) => {
    set({ quickStockLoading: true, quickStockError: null });

    try {
      const response = await createQuickStockLocalOperationalProduct(payload);

      set({
        quickStockLoading: false,
        quickStockResult: response?.data ?? response,
      });

      return response;
    } catch (error) {
      const mapped = normalizeQuickStockError(error, "สร้างสินค้า Local ไม่สำเร็จ");

      set({
        quickStockLoading: false,
        quickStockError: mapped,
      });

      throw error;
    }
  },

  updateOperationalProductAction: async (id, payload) => {
    set({ quickStockLoading: true, quickStockError: null });

    try {
      const response = await updateQuickStockOperationalProduct(id, payload);

      set({
        quickStockLoading: false,
        quickStockResult: response?.data ?? response,
      });

      return response;
    } catch (error) {
      const mapped = normalizeQuickStockError(
        error,
        "บันทึกข้อมูลสินค้าไม่สำเร็จ"
      );

      set({
        quickStockLoading: false,
        quickStockError: mapped,
      });

      throw error;
    }
  },

  deleteOperationalProductAction: async (id) => {
    set({ quickStockLoading: true, quickStockError: null });

    try {
      await deleteQuickStockOperationalProduct(id);

      set({
        quickStockLoading: false,
        quickStockResult: true,
      });

      return true;
    } catch (error) {
      const mapped = normalizeQuickStockError(error, "ลบสินค้าไม่สำเร็จ");

      set({
        quickStockLoading: false,
        quickStockError: mapped,
      });

      return false;
    }
  },

  quickStockIntakeExistingAction: async (payload) => {
    set({ quickStockLoading: true, quickStockError: null });

    try {
      const response = await commitQuickStockExistingIntake(payload);

      set({
        quickStockLoading: false,
        quickStockResult: response?.data ?? response,
      });

      return response;
    } catch (error) {
      const mapped = normalizeQuickStockError(
        error,
        "รับสินค้าเข้าจาก Product เดิมล้มเหลว"
      );

      set({
        quickStockLoading: false,
        quickStockError: mapped,
      });

      throw error;
    }
  },

  resetQuickStockRuntimeAction: () =>
    set({
      isLoading: false,
      error: null,
      quickStockLoading: false,
      quickStockError: null,
      quickStockResult: null,
      operationalProducts: [],
      templateProducts: [],
      searchProducts: [],
    }),
}));

export default useQuickStockRuntimeStore;
