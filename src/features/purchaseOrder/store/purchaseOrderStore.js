import { create } from 'zustand';
import { calculatePurchaseTotals, isWithinCreditLimit } from '../engines/liveCalculatorEngine';
import apiClient from '@/utils/apiClient'; // 🟢 ดึงท่อเชื่อมโยงตรงเข้าพอร์ต 5000 เพื่อความปลอดภัยสูงสุด

export const usePurchaseOrderStore = create((set, get) => ({
  // =========================================================
  // [LEGACY STATE & ACTIONS - BACKWARD COMPATIBILITY PRESERVED]
  // =========================================================
  historyList: [],
  isLoading: false,
  error: null,
  purchaseOrder: null, // เก็บรายละเอียดใบสั่งซื้อเดี่ยวสำหรับโหมดดู/แก้ไข

  fetchHistoryLegacy: async (apiCallback) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiCallback();
      set({ historyList: data, isLoading: false });
    } catch (err) {
      set({ error: err.message || 'ระบบไม่สามารถเข้าถึงข้อมูลประวัติการจัดซื้อเดิมได้', isLoading: false });
    }
  },

  // =========================================================
  // [NEW OFFICIAL LIVE ACTION - v2 STABLE IMPLEMENTATION]
  // =========================================================
  fetchAllPurchaseOrdersAction: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.get('/purchase-orders');
      const actualData = res?.data?.data || res?.data || [];
      set({ historyList: actualData, isLoading: false });
    } catch (err) {
      set({ error: err.message || 'กระบวนการเชื่อมต่อดึงประวัติจริงล้มเหลว', isLoading: false });
    }
  },

  fetchPurchaseOrderById: async (id) => {
    set({ isLoading: true, error: null, purchaseOrder: null });
    try {
      const res = await apiClient.get(`/purchase-orders/${id}`);
      set({ purchaseOrder: res.data, isLoading: false });
    } catch (err) {
      set({ error: err.message || 'ไม่สามารถโหลดข้อมูลใบสั่งซื้อนี้ได้', isLoading: false });
    }
  },

  // 🚀 [ADDED ACTIONS] ซ่อมท่อทางส่งข้อมูลเชื่อมต่อ API หน้าบ้าน ให้ยิงบันทึกใบสั่งซื้อ PO ลงฐานข้อมูลได้จริงพอร์ต 5000
  createPurchaseOrder: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.post('/purchase-orders', payload);
      set({ isLoading: false });
      return res.data; // ส่งออบเจกต์ใบสั่งซื้อใหม่ที่มี .id กลับคืนให้ Hook นำไปเปลี่ยนเส้นทางพาธพิมพ์บิลต่อ
    } catch (err) {
      set({ error: err.message || 'เกิดข้อผิดพลาดระหว่างส่งบันทึกใบสั่งซื้อ', isLoading: false });
      throw err;
    }
  },

  updatePurchaseOrder: async (id, payload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.put(`/purchase-orders/${id}`, payload);
      set({ isLoading: false });
      return res.data;
    } catch (err) {
      set({ error: err.message || 'เกิดข้อผิดพลาดระหว่างอัปเดตใบสั่งซื้อ', isLoading: false });
      throw err;
    }
  },

  // =========================================================
  // [NEW STATE - v2 STABLE IMPLEMENTATION]
  // =========================================================
  cartItems: [],
  supplierInfo: {
    id: null,
    name: '',
    creditLimit: 0,
    outstandingBalance: 0,
  },
  financials: {
    subtotal: 0,
    tax: 0,
    netTotal: 0,
  },
  isCreditLimitExceeded: false,

  // =========================================================
  // [NEW ACTIONS - v2 STABLE IMPLEMENTATION]
  // =========================================================
  setSupplier: (supplier) => {
    set({
      supplierInfo: {
        id: supplier.id || null,
        name: supplier.name || '',
        creditLimit: Number(supplier.creditLimit) || 0,
        outstandingBalance: Number(supplier.outstandingBalance) || 0,
      },
    });
    get().recalculate();
  },

  addToCart: (product) => {
    set((state) => {
      const existingIndex = state.cartItems.findIndex((item) => item.productId === product.id);
      let updatedCart = [...state.cartItems];

      if (existingIndex > -1) {
        updatedCart[existingIndex] = {
          ...updatedCart[existingIndex],
          quantity: updatedCart[existingIndex].quantity + (product.quantity || 1),
        };
      } else {
        updatedCart.push({
          productId: product.id,
          name: product.name,
          unitPrice: Number(product.costPrice) || 0,
          quantity: Number(product.quantity) || 1,
          discountAmount: 0,
          productType: product.type || 'SIMPLE',
          serialNumbers: [],
        });
      }
      return { cartItems: updatedCart };
    });
    get().recalculate();
  },

  updateCartQuantity: (productId, quantity) => {
    set((state) => ({
      cartItems: state.cartItems.map((item) =>
        item.productId === productId ? { ...item, quantity: Math.max(1, Number(quantity)) } : item
      ),
    }));
    get().recalculate();
  },

  updateCartDiscount: (productId, discountAmount) => {
    set((state) => ({
      cartItems: state.cartItems.map((item) =>
        item.productId === productId ? { ...item, discountAmount: Math.max(0, Number(discountAmount)) } : item
      ),
    }));
    get().recalculate();
  },

  removeFromCart: (productId) => {
    set((state) => ({
      cartItems: state.cartItems.filter((item) => item.productId !== productId),
    }));
    get().recalculate();
  },

  recalculate: () => {
    const { cartItems, supplierInfo } = get();
    const totals = calculatePurchaseTotals(cartItems);

    const isExceeded = !isWithinCreditLimit(
      totals.netTotal,
      supplierInfo.creditLimit,
      supplierInfo.outstandingBalance
    );

    set({
      financials: {
        subtotal: totals.subtotal,
        tax: totals.tax,
        netTotal: totals.netTotal,
      },
      isCreditLimitExceeded: isExceeded,
    });
  },

  clearStore: () => {
    set({
      cartItems: [],
      financials: {
        subtotal: 0,
        tax: 0,
        netTotal: 0,
      },
      isCreditLimitExceeded: false,
      purchaseOrder: null,
    });
  }
}));