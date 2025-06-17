// src/store/cartStore.js
import { create } from 'zustand';
import { clearServerCart, fetchCartFromServer, syncCartToServer } from '../api/cartApi';

export const useCartStore = create((set, get) => ({
  cartItems: [],

  setCart: (items) => {
    set({ cartItems: items });
  },

  addToCart: (product) => {
    const { cartItems } = get();
    const existing = cartItems.find(item => item.id === product.id);
    if (existing) {
      set({
        cartItems: cartItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      });
    } else {
      set({
        cartItems: [...cartItems, { ...product, quantity: 1 }]
      });
    }
  },

  removeFromCart: (id) => {
    set({
      cartItems: get().cartItems.filter(item => item.id !== id)
    });
  },

  clearCart: () => {
    set({ cartItems: [] });
  },

  increaseQuantity: (id) => {
    const { cartItems } = get();
    set({
      cartItems: cartItems.map(item =>
        item.id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    });
  },

  decreaseQuantity: (id) => {
    const { cartItems } = get();
    set({
      cartItems: cartItems
        .map(item =>
          item.id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter(item => item.quantity > 0)
    });
  },

  totalAmount: () => {
    return get().cartItems.reduce(
      (sum, item) => sum + (item.price || 0) * item.quantity,
      0
    );
  },

  totalQuantity: () => {
    return get().cartItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
  },

  hasItem: (productId) => {
    return get().cartItems.some(item => item.id === productId);
  },

  syncCartAction: async () => {
    try {
      const cartItems = get().cartItems;
      await syncCartToServer(cartItems);
    } catch (err) {
      console.error('❌ syncCartAction error:', err);
    }
  },

  fetchCartAction: async () => {
    try {
      const items = await fetchCartFromServer();
      set({ cartItems: items });
    } catch (err) {
      console.error('❌ fetchCartAction error:', err);
    }
  },

  clearServerCartAction: async () => {
    try {
      await clearServerCart();
      set({ cartItems: [] });
    } catch (err) {
      console.error('❌ clearServerCartAction error:', err);
    }
  },
}));
