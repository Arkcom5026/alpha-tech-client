// ✅ src/features/cart/store/cartStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      carts: [],

      addToCart: (item) => {
        const currentCarts = get().carts;
        const existing = currentCarts.find((i) => i.productId === item.productId);

        if (existing) {
          const updatedCarts = currentCarts.map((i) =>
            i.productId === item.productId ? { ...i, qty: i.qty + item.qty } : i
          );
          set({ carts: updatedCarts });
        } else {
          set({ carts: [...currentCarts, item] });
        }
      },

      removeFromCart: (productId) => {
        const currentCarts = get().carts.filter((item) => item.productId !== productId);
        set({ carts: currentCarts });
      },

      updateCartQty: (productId, qty) => {
        const updated = get().carts.map((item) =>
          item.productId === productId ? { ...item, qty } : item
        );
        set({ carts: updated });
      },

      getTotalPrice: () => {
        return get().carts.reduce((total, item) => {
            return total + item.retailPrice * item.count;
        }, 0);

    },

      actionUpdateQuantity: (productId, newQuantity) => {
        set((state) => ({
          carts: state.carts.map((item) =>
            item.id === productId
              ? { ...item, count: Math.max(1, newQuantity) }
              : item
          ),
        }));
      },

      clearCart: () => set({ carts: [] }),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ carts: state.carts }),
    }
  )
);

export default useCartStore;
