import { create } from 'zustand';
import { calculatePurchaseTotals, isWithinCreditLimit } from '../engines/liveCalculatorEngine';
import { procurementService } from '../services/procurementService'; // เรียกใช้บริการจริง

export const usePurchaseOrderStore = create((set, get) => ({
  // =========================================================
  // [LEGACY STATE & ACTIONS - BACKWARD COMPATIBILITY PRESERVED]
  // =========================================================
  historyList: [],
  isLoading: false,
  error: null,

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
  // ดึงข้อมูลจริงผ่านบริการ API เครือข่ายคลังสินค้าพอร์ต 4000/5000
  // =========================================================
  fetchAllPurchaseOrdersAction: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await procurementService.getAllPurchaseOrders();
      set({ historyList: data, isLoading: false });
    } catch (err) {
      set({ error: err.message || 'กระบวนการเชื่อมต่อดึงประวัติจริงล้มเหลว', isLoading: false });
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
    });
  }
}));