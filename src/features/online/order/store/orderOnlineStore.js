import { create } from "zustand";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} from "../api/orderOnlineApi";
import { useCartStore } from "../../cart/store/cartStore";

export const useOrderOnlineStore = create((set, get) => ({
  isSubmitting: false,
  orders: [],
  selectedOrder: null,
  isLoading: false,
  error: null,

  // ✅ สร้างคำสั่งซื้อใหม่
  submitOrderAction: async (userInputData = {}) => {
    const { cartItems, clearCart } = useCartStore.getState();
    try {
      set({ isSubmitting: true });

      const payload = {
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.priceAtThatTime || item.price || 0,
        })),
        ...userInputData,
      };

      const createdOrder = await createOrder(payload);
      clearCart();
      return createdOrder;
    } catch (err) {
      console.error("❌ submitOrderAction error:", err);
      return null;
    } finally {
      set({ isSubmitting: false });
    }
  },

  // ✅ โหลดคำสั่งซื้อทั้งหมด
  loadOrdersAction: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await getAllOrders();
      set({ orders: data });
    } catch (err) {
      console.error("❌ loadOrdersAction error:", err);
      set({ error: "ไม่สามารถโหลดรายการคำสั่งซื้อได้" });
    } finally {
      set({ isLoading: false });
    }
  },

  // ✅ ดึงคำสั่งซื้อทีละรายการ
  loadOrderByIdAction: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const data = await getOrderById(id);
      set({ selectedOrder: data });
    } catch (err) {
      console.error("❌ loadOrderByIdAction error:", err);
      set({ error: "ไม่พบคำสั่งซื้อนี้" });
    } finally {
      set({ isLoading: false });
    }
  },

  // ✅ อัปเดตสถานะคำสั่งซื้อ
  updateOrderStatusAction: async (id, payload) => {
    try {
      const data = await updateOrderStatus(id, payload);
      // โหลดใหม่หลังอัปเดต (optional)
      get().loadOrdersAction();
      return data;
    } catch (err) {
      console.error("❌ updateOrderStatusAction error:", err);
      throw err;
    }
  },

  // ✅ ลบคำสั่งซื้อ
  deleteOrderAction: async (id) => {
    try {
      await deleteOrder(id);
      get().loadOrdersAction();
    } catch (err) {
      console.error("❌ deleteOrderAction error:", err);
    }
  },
}));