// src/store/cartStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  addToServerCartItem,
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

      addToCart: async (product) => {
        const { cartItems } = get();
        const existing = cartItems.find(item => item.id === product.id);
        const { token } = useAuthStore.getState();

        if (token) {
          try {
            if (existing) {
              await updateCartItemQuantity(product.productId || product.id, existing.quantity + 1);
            } else {
              await addToServerCartItem(product.productId || product.id, 1);
              await new Promise(resolve => setTimeout(resolve, 200));
              await updateCartItemQuantity(product.productId || product.id, 1);
            }
            await get().fetchCartAction();
          } catch (err) {
            throw err;
          }
        } else if (existing) {
          await get().increaseQuantity(product.id);
        } else {
          const newItem = { ...product, quantity: 1 };
          set({ cartItems: [...cartItems, newItem] });
        }
      },

      fetchCartBranchPricesAction: async (branchId) => {
        try {
          const res = await getBranchPrices(branchId);
          set({ branchPrices: res });
          return res;
        } catch (err) {
          throw err;
        }
      },

      removeFromCart: async (id) => {
        const { token } = useAuthStore.getState();
        if (token && id) {
          await removeCartItemFromServer(id);
        }

        set({
          cartItems: get().cartItems.filter(item => item.id !== id),
          selectedItems: get().selectedItems.filter(itemId => itemId !== id),
        });
      },

      clearCart: () => {
        set({ cartItems: [], selectedItems: [] });
      },

      increaseQuantity: async (id) => {
        const { cartItems } = get();
        const current = cartItems.find(item => item.id === id);
        if (!current) return false;

        const nextQuantity = Number(current.quantity || 0) + 1;
        const { token } = useAuthStore.getState();
        if (token) {
          await updateCartItemQuantity(current.productId, nextQuantity);
        }

        set({
          cartItems: get().cartItems.map(item =>
            item.id === id ? { ...item, quantity: nextQuantity } : item
          ),
        });
        return true;
      },

      decreaseQuantity: async (id) => {
        const { cartItems } = get();
        const current = cartItems.find(item => item.id === id);
        if (!current) return false;

        const nextQuantity = Number(current.quantity || 0) - 1;
        const { token } = useAuthStore.getState();

        if (token) {
          if (nextQuantity > 0) {
            await updateCartItemQuantity(current.productId, nextQuantity);
          } else if (current.productId) {
            await removeCartItemFromServer(current.productId);
          }
        }

        set({
          cartItems: get().cartItems
            .map(item => item.id === id ? { ...item, quantity: nextQuantity } : item)
            .filter(item => item.quantity > 0),
          selectedItems: nextQuantity > 0
            ? get().selectedItems
            : get().selectedItems.filter(itemId => itemId !== id),
        });
        return true;
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
        const cartItems = get().cartItems;
        const mappedItems = cartItems
          .filter(item => item.id && item.quantity)
          .map(item => ({
            productId: item.id,
            quantity: item.quantity,
            priceAtThatTime: item.priceAtThatTime || item.priceOnline || item.price || 0,
          }));
        await mergeCartToServer(mappedItems);
        return true;
      },

      fetchCartAction: async () => {
        const token = useAuthStore.getState().token;
        if (!token) return [];

        const items = await fetchCartFromServer();
        set({ cartItems: items });
        return items;
      },

      clearServerCartAction: async () => {
        await clearServerCart();
        set({ cartItems: [], selectedItems: [] });
        return true;
      },

      deleteSelectedCartItemsAction: async () => {
        const { selectedItems } = get();
        if (selectedItems.length === 0) return false;

        await deleteSelectedCartItems(selectedItems);
        set({
          cartItems: get().cartItems.filter(item => !selectedItems.includes(item.id)),
          selectedItems: [],
        });
        return true;
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
      partialize: (state) => ({
        cartItems: state.cartItems,
        selectedItems: state.selectedItems,
      }),
    }
  )
);
