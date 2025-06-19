// 📦 branchPriceStore.js
import { create } from 'zustand';
import {
  getBranchPricesByBranch,
  upsertBranchPrice,
  getAllProductsWithBranchPrice,
} from '../api/branchPriceApi';

const useBranchPriceStore = create((set) => ({
  branchPrices: [],
  allProductsWithPrice: [],
  loading: false,
  error: null,

  // ✅ โหลดราคาทั้งหมดของสาขาปัจจุบัน (จาก token)
  fetchBranchPricesAction: async () => {
    set({ loading: true, error: null });
    try {
      const res = await getBranchPricesByBranch();
      set({ branchPrices: res.data });
    } catch (err) {
      console.error('❌ fetchBranchPricesAction error:', err);
      set({ error: 'ไม่สามารถโหลดรายการราคาได้' });
    } finally {
      set({ loading: false });
    }
  },

  // ✅ โหลดสินค้าทั้งหมดพร้อมราคาสำหรับสาขานี้ (แม้ยังไม่เคยตั้งราคา)
  fetchAllProductsWithPriceAction: async () => {
    set({ loading: true, error: null });
    try {
      const res = await getAllProductsWithBranchPrice();
      set({ allProductsWithPrice: res.data });
    } catch (err) {
      console.error('❌ fetchAllProductsWithPriceAction error:', err);
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
