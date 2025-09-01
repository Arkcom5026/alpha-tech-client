// 📦 branchPriceStore.js
import { create } from 'zustand';
import {
  getBranchPricesByBranch,
  getAllProductsWithBranchPrice,
  upsertBranchPrice,
  getBranchPricesByBranchId,
  getAllProductsWithBranchPriceByBranchId,
} from '../api/branchPriceApi';

const useBranchPriceStore = create((set) => ({
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
    set({ loading: true, error: null });
    try {
      // 🧹 Sanitize filters (centralized)
      const toNum = (v) => (v === '' || v === null || v === undefined ? undefined : Number(v));
      const params = {
        categoryId: toNum(filters.categoryId),
        productTypeId: toNum(filters.productTypeId),
        productProfileId: toNum(filters.productProfileId),
        productTemplateId: toNum(filters.productTemplateId),
        searchText: (filters.searchText || '').trim() || undefined,
        includeInactive: filters.includeInactive ?? false,
        page: filters.page ?? undefined,
        limit: filters.limit ?? undefined,
      };

      // 🛑 Skip duplicate requests with same params
      set((state) => {
        const nextKey = JSON.stringify(params);
        if (state.__lastFetchKey === nextKey) {
          // same params, no need to hit API again
          throw { __skip: true };
        }
        return { __lastFetchKey: nextKey };
      });

      console.log('🔎 [branchPriceStore] fetchAllProductsWithPrice params →', params);
      const res = await getAllProductsWithBranchPrice(params);
      set({ allProductsWithPrice: res.data });
    } catch (err) {
      if (err && err.__skip) {
        // skipped duplicate fetch silently
      } else {
        console.error('❌ fetchAllProductsWithPriceByTokenAction error:', err);
        set({ error: 'ไม่สามารถโหลดข้อมูลสินค้าได้' });
      }
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
      await import('../api/branchPriceApi').then((mod) =>
        mod.updateMultipleBranchPrices(updatedList)
      );

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
