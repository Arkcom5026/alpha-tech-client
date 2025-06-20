// 📦 branchPriceStore.js
import { create } from 'zustand';
import {
  getBranchPricesByBranch,
    getAllProductsWithBranchPrice,  
  upsertBranchPrice,
} from '../api/branchPriceApi';

const useBranchPriceStore = create((set) => ({
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
  fetchAllProductsWithPriceByTokenAction: async () => {
    set({ loading: true, error: null });
    try {
      const res = await getAllProductsWithBranchPrice();
      console.log('fetchAllProductsWithPriceByTokenAction res :', res);
      set({ allProductsWithPrice: res.data });
    } catch (err) {
      console.error('❌ fetchAllProductsWithPriceByTokenAction error:', err);
      set({ error: 'ไม่สามารถโหลดข้อมูลสินค้าได้' });
    } finally {
      set({ loading: false });
    }
  },

  // ✅ โหลดสินค้าทั้งหมดพร้อมราคาสำหรับ branchId ที่กำหนด (Online)
  fetchAllProductsWithPriceByIdAction: async (branchId) => {
    set({ loading: true, error: null });
    try {
      const res = await getAllProductsWithBranchPriceByBranchId(branchId);
      console.log('fetchAllProductsWithPriceByIdAction res :', res);
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
}));

export default useBranchPriceStore;
