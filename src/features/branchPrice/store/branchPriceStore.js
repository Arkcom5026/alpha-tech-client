// 📦 branchPriceStore.js
import { create } from 'zustand';
import {
  getBranchPricesByBranch,
  getAllProductsWithBranchPrice,
  upsertBranchPrice,
  getBranchPricesByBranchId,
  getAllProductsWithBranchPriceByBranchId,
  updateMultipleBranchPrices, // 🟢 FIXED: เพิ่มการอิมพอร์ตตรงนี้ไว้ที่หัวเสา
} from '../api/branchPriceApi';

const useBranchPriceStore = create((set, get) => ({
  __lastFetchKey: null,
  branchPrices: [],
  allProductsWithPrice: [],
  loading: false,
  error: null,

  // ✅ โหลดราคาทั้งหมดของสาขาปัจจุบัน (จาก token - POS)
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

  // ✅ โหลดราคาทั้งหมดตาม branchId ที่กำหนด (เช่น สำหรับฝั่ง Online)
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

  // ✅ โหลดสินค้าทั้งหมดพร้อมราคาจาก token context (POS)
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

  // ✅ โหลดสินค้าทั้งหมดพร้อมราคาสำหรับ branchId ที่กำหนด (Online)
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

  // ✅ เพิ่มหรือแก้ไขราคา (ใช้ branchId และ userId จาก token)
  upsertBranchPriceAction: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await upsertBranchPrice(data); // data = { productId, price, ... }

      set((state) => ({
        allProductsWithPrice: state.allProductsWithPrice.map((entry) =>
          entry.product.id === res.data.productId
            ? { ...entry, branchPrice: res.data }
            : entry
        ),
      }));
    } catch (err) {
      console.error('❌ upsertBranchPriceAction error:', err);
      set({ error: 'ไม่สามารถบันทึกราคาได้' });
    } finally {
      set({ loading: false });
    }
  },


  // ✅ อัปเดตราคาหลายรายการพร้อมกัน (bulk update)
  updateMultipleBranchPricesAction: async (updatedList) => {
    set({ loading: true, error: null });
    try {
      // 🟢 FIXED: ยุบคำสั่ง await import ทิ้ง แล้วเรียกใช้ฟังก์ชันตรง ๆ จากหัวเสาได้ทันที
      await updateMultipleBranchPrices(updatedList);

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
    } catch (err) {
      console.error('❌ updateMultipleBranchPricesAction error:', err);
      set({ error: 'ไม่สามารถอัปเดตราคาได้' });
    } finally {
      set({ loading: false });
    }
  },

  // 🧰 Utilities
  clearLastFetchKey: () => set({ __lastFetchKey: null }),
  resetError: () => set({ error: null }),
  resetState: () => set({
    __lastFetchKey: null,
    branchPrices: [],
    allProductsWithPrice: [],
    loading: false,
    error: null,
  }),
}));

export default useBranchPriceStore;