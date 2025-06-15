// 📁 src/features/online/cart/cartStore.js
import { create } from "zustand";

export const useCartStore = create((set, get) => ({
  branchId: null,
  cartItems: [],

  setBranchId: (branchId) => {
    set({ branchId, cartItems: [] }); // ✅ reset cart เมื่อเปลี่ยนสาขา
  },

  addToCart: (item) => {
    const { branchId, cartItems } = get();

    if (branchId === null) {
      console.warn("ยังไม่ได้เลือกสาขา");
      return;
    }

    if (item.branchId !== branchId) {
      console.warn("ไม่สามารถเพิ่มสินค้าข้ามสาขาได้");
      return;
    }

    // ✅ เพิ่มสินค้า
    set({ cartItems: [...cartItems, item] });
  },

  removeFromCart: (productId) => {
    const { cartItems } = get();
    const updated = cartItems.filter((item) => item.productId !== productId);
    set({ cartItems: updated });
  },

  clearCart: () => {
    set({ cartItems: [] });
  },
}));
