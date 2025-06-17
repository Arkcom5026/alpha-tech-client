import { create } from "zustand";
import { createOrder } from "../api/orderOnlineApi";
import { useCartStore } from "../../cart/store/cartStore";


export const useOrderOnlineStore = create((set, get) => ({
  isSubmitting: false,

  submitOrderAction: async (userInputData = {}) => {
    const { cartItems, clearCart } = useCartStore.getState();
    try {
      set({ isSubmitting: true });

      const payload = {
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        ...userInputData,
      };

      const createdOrder = await createOrder(payload);
      clearCart();
      return createdOrder;
    } catch (err) {
      return null;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));
