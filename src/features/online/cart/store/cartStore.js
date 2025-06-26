// src/store/cartStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  clearServerCart,
  fetchCartFromServer,
  mergeCartToServer,
  updateCartItemQuantity,
  removeCartItemFromServer,
  deleteSelectedCartItems,
  getBranchPrices,
} from '../api/cartApi';
import { useAuthStore } from '@/features/auth/store/authStore';

export const useCartStore = create(
  persist(
    (set, get) => ({
      cartItems: [],
      selectedItems: [],
      branchPrices: [],

      setCart: (items) => {
        set({ cartItems: items });
      },

      addToCart: (product) => {
        const { cartItems } = get();
        const existing = cartItems.find(item => item.id === product.id);
        if (existing) {
          get().increaseQuantity(product.id);
        } else {
          const newItem = { ...product, quantity: 1 };
          set({ cartItems: [...cartItems, newItem] });
        }
      },

      fetchCartBranchPricesAction: async (branchId) => {
        try {
          const res = await getBranchPrices(branchId);
          set({ branchPrices: res });
        } catch (err) {
          console.error('❌ fetchCartBranchPricesAction error:', err);
        }
      },


      removeFromCart: async (id) => {
        set({
          cartItems: get().cartItems.filter(item => item.id !== id),
          selectedItems: get().selectedItems.filter(itemId => itemId !== id)
        });

        const { token } = useAuthStore.getState();
        if (!token || !id) return;

        try {
          await removeCartItemFromServer(id);
        } catch (err) {
          console.error('❌ removeFromCart sync error:', err);
        }
      },

      clearCart: () => {
        set({ cartItems: [], selectedItems: [] });
      },

      increaseQuantity: async (id) => {
        const { cartItems } = get();
        const updated = cartItems.map(item =>
          item.id === id ? { ...item, quantity: item.quantity + 1 } : item
        );
        set({ cartItems: updated });

        const { token } = useAuthStore.getState();
        const found = updated.find(item => item.id === id);
        if (token && found) {
          try {
            await updateCartItemQuantity(found.productId, found.quantity);
          } catch (err) {
            console.error('❌ increaseQuantity sync error:', err);
          }
        }
      },

      decreaseQuantity: async (id) => {
        const { cartItems } = get();

        const removed = cartItems.find(item => item.id === id);
        const updated = cartItems
          .map(item =>
            item.id === id ? { ...item, quantity: item.quantity - 1 } : item
          )
          .filter(item => item.quantity > 0);

        set({ cartItems: updated });

        const { token } = useAuthStore.getState();
        const found = updated.find(item => item.id === id);

        if (!token || !id) return;

        if (found) {
          try {
            await updateCartItemQuantity(found.productId, found.quantity);
          } catch (err) {
            console.error('❌ decreaseQuantity sync error:', err);
          }
        } else if (removed?.productId) {
          try {
            await removeCartItemFromServer(removed.productId);
          } catch (err) {
            console.error('❌ decreaseQuantity delete sync error:', err);
          }
        }
      },

      toggleSelectItem: (id) => {
        const { selectedItems } = get();
        const isSelected = selectedItems.includes(id);
        const updated = isSelected
          ? selectedItems.filter(itemId => itemId !== id)
          : [...selectedItems, id];
        set({ selectedItems: updated });
      },

      clearSelectedItems: () => {
        set({ selectedItems: [] });
      },

      totalAmount: () => {
        const { cartItems, selectedItems } = get();
        return cartItems
          .filter(item => selectedItems.includes(item.id))
          .reduce((sum, item) => {
            const price = item.priceAtThatTime || item.priceOnline || item.price || 0;
            return sum + price * item.quantity;
          }, 0);
      },

      totalQuantity: () => {
        const { cartItems, selectedItems } = get();
        return cartItems
          .filter(item => selectedItems.includes(item.id))
          .reduce((sum, item) => sum + item.quantity, 0);
      },

      hasItem: (productId) => {
        return get().cartItems.some(item => item.id === productId);
      },

      mergeCartAction: async () => {
        try {
          const cartItems = get().cartItems;
          const mappedItems = cartItems
            .filter(item => item.id && item.quantity)
            .map(item => ({
              productId: item.id,
              quantity: item.quantity,
              priceAtThatTime: item.priceAtThatTime || item.priceOnline || item.price || 0,
            }));
          await mergeCartToServer(mappedItems);
        } catch (err) {
          console.error('❌ mergeCartAction error:', err);
        }
      },

      fetchCartAction: async () => {
        try {
          const token = useAuthStore.getState().token;
          if (!token) {
            // ✅ ยังไม่ login → ใช้ค่าใน localStorage (ไม่ fetch server)
            return;
          }
      
          const items = await fetchCartFromServer();
          set({ cartItems: items });
        } catch (err) {
          console.error('❌ fetchCartAction error:', err);
        }
      },

      clearServerCartAction: async () => {
        try {
          await clearServerCart();
          set({ cartItems: [], selectedItems: [] });
        } catch (err) {
          console.error('❌ clearServerCartAction error:', err);
        }
      },

      deleteSelectedCartItemsAction: async () => {
        const { selectedItems, setCart } = get();

        if (selectedItems.length === 0) return;

        try {
          await deleteSelectedCartItems(selectedItems);

          set({
            cartItems: get().cartItems.filter(item => !selectedItems.includes(item.id)),
            selectedItems: [],
          });
        } catch (err) {
          console.error('❌ deleteSelectedCartItemsAction error:', err);
        }
      },

      clearStorage: () => {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('cart-storage');
        }
        set({ cartItems: [], selectedItems: [] });
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
