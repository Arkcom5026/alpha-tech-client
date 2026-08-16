// 📦 branchPriceStore.js
import { create } from 'zustand';
import {
  getBranchPricesByBranch,
  getAllProductsWithBranchPrice,
  upsertBranchPrice,
  getBranchPricesByBranchId,
  getAllProductsWithBranchPriceByBranchId,
  updateMultipleBranchPrices,
} from '../api/branchPriceApi';

const useBranchPriceStore = create((set, get) => ({
  __lastFetchKey: null,
  branchPrices: [],
  allProductsWithPrice: [],
  loading: false,
  mutating: false,
  error: null,

  fetchBranchPricesByTokenAction: async () => {
    set({ loading: true, error: null });
    try {
      const res = await getBranchPricesByBranch();
      set({ branchPrices: res.data });
    } catch (err) {
      console.error('❌ fetchBranchPricesByTokenAction error:', err);
      set({ error: 'ไม่สามารถโหลดรายการราคาได้' });
    } finally {
      set({ loading: false });
    }
  },

  fetchBranchPricesByIdAction: async (branchId) => {
    set({ loading: true, error: null });
    try {
      const res = await getBranchPricesByBranchId(branchId);
      set({ branchPrices: res.data });
    } catch (err) {
      console.error('❌ fetchBranchPricesByIdAction error:', err);
      set({ error: 'ไม่สามารถโหลดรายการราคาได้' });
    } finally {
      set({ loading: false });
    }
  },

  fetchAllProductsWithPriceByTokenAction: async (filters = {}) => {
    const toOptionalNumber = (value) => {
      if (value === '' || value === null || value === undefined) return undefined;
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : undefined;
    };

    const params = {
      categoryId: toOptionalNumber(filters.categoryId),
      productTypeId: toOptionalNumber(filters.productTypeId),
      brandId: toOptionalNumber(filters.brandId),
      searchText: String(filters.searchText || '').trim() || undefined,
      includeInactive: filters.includeInactive === true,
      page: toOptionalNumber(filters.page),
      limit: toOptionalNumber(filters.limit),
    };

    const nextKey = JSON.stringify(params);
    if (get().__lastFetchKey === nextKey) return;

    set({ loading: true, error: null, __lastFetchKey: nextKey });

    try {
      const res = await getAllProductsWithBranchPrice(params);
      const payload = res?.data;
      const rows = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.items)
          ? payload.items
          : [];

      set({ allProductsWithPrice: rows });
    } catch (err) {
      console.error('❌ fetchAllProductsWithPriceByTokenAction error:', err);
      set({
        error: err?.response?.data?.message || 'ไม่สามารถโหลดข้อมูลสินค้าได้',
        __lastFetchKey: null,
      });
    } finally {
      set({ loading: false });
    }
  },

  fetchAllProductsWithPriceByIdAction: async (branchId) => {
    set({ loading: true, error: null });
    try {
      const res = await getAllProductsWithBranchPriceByBranchId(branchId);
      set({ allProductsWithPrice: res.data });
    } catch (err) {
      console.error('❌ fetchAllProductsWithPriceByIdAction error:', err);
      set({ error: 'ไม่สามารถโหลดข้อมูลสินค้าได้' });
    } finally {
      set({ loading: false });
    }
  },

  upsertBranchPriceAction: async (data) => {
    if (get().mutating) {
      throw new Error('กำลังบันทึกราคาสินค้าอยู่ กรุณารอสักครู่');
    }
    set({ mutating: true, error: null });
    try {
      const res = await upsertBranchPrice(data);
      set((state) => ({
        allProductsWithPrice: state.allProductsWithPrice.map((entry) =>
          entry.product.id === res.data.productId
            ? { ...entry, branchPrice: res.data }
            : entry
        ),
      }));
      return res;
    } catch (err) {
      console.error('❌ upsertBranchPriceAction error:', err);
      set({ error: err?.response?.data?.message || err?.message || 'ไม่สามารถบันทึกราคาได้' });
      throw err;
    } finally {
      set({ mutating: false });
    }
  },

  updateMultipleBranchPricesAction: async (updatedList) => {
    if (get().mutating) {
      throw new Error('กำลังบันทึกราคาสินค้าอยู่ กรุณารอสักครู่');
    }
    set({ mutating: true, error: null });
    try {
      const result = await updateMultipleBranchPrices(updatedList);

      set((state) => ({
        allProductsWithPrice: state.allProductsWithPrice.map((item) => {
          const updated = updatedList.find((u) => u.productId === item.product.id);
          return updated
            ? {
                ...item,
                branchPrice: {
                  ...item.branchPrice,
                  ...updated,
                },
              }
            : item;
        }),
      }));
      return result;
    } catch (err) {
      console.error('❌ updateMultipleBranchPricesAction error:', err);
      set({ error: err?.response?.data?.message || err?.message || 'ไม่สามารถอัปเดตราคาได้' });
      throw err;
    } finally {
      set({ mutating: false });
    }
  },

  clearLastFetchKey: () => set({ __lastFetchKey: null }),
  resetError: () => set({ error: null }),
  resetState: () => set({
    __lastFetchKey: null,
    branchPrices: [],
    allProductsWithPrice: [],
    loading: false,
    mutating: false,
    error: null,
  }),
}));

export default useBranchPriceStore;
