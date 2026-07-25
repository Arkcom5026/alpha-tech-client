import { create } from 'zustand';
import { calculatePurchaseTotals, isWithinCreditLimit } from '../engines/liveCalculatorEngine';
import {
  createPurchaseOrder as createPurchaseOrderRequest,
  getPurchaseOrderById,
  getPurchaseOrders,
  updatePurchaseOrder as updatePurchaseOrderRequest,
} from '../api/purchaseOrderApi';

const pickPurchaseOrderList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

export const usePurchaseOrderStore = create((set, get) => ({
  historyList: [],
  isLoading: false,
  error: null,
  purchaseOrder: null,

  fetchHistoryLegacy: async (apiCallback) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiCallback();
      set({ historyList: data, isLoading: false });
    } catch (err) {
      set({
        error: err.message || 'ระบบไม่สามารถเข้าถึงข้อมูลประวัติการจัดซื้อเดิมได้',
        isLoading: false,
      });
    }
  },

  fetchAllPurchaseOrdersAction: async () => {
    set({ isLoading: true, error: null });
    try {
      const payload = await getPurchaseOrders();
      set({ historyList: pickPurchaseOrderList(payload), isLoading: false });
    } catch (err) {
      set({
        error: err.message || 'กระบวนการเชื่อมต่อดึงประวัติจริงล้มเหลว',
        isLoading: false,
      });
    }
  },

  fetchPurchaseOrderById: async (id) => {
    set({ isLoading: true, error: null, purchaseOrder: null });
    try {
      const purchaseOrder = await getPurchaseOrderById(id);
      set({ purchaseOrder, isLoading: false });
      return purchaseOrder;
    } catch (err) {
      set({
        error: err.message || 'ไม่สามารถโหลดข้อมูลใบสั่งซื้อนี้ได้',
        isLoading: false,
      });
      throw err;
    }
  },

  createPurchaseOrder: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const created = await createPurchaseOrderRequest(payload);
      set({ isLoading: false });
      return created;
    } catch (err) {
      set({
        error: err.message || 'เกิดข้อผิดพลาดระหว่างส่งบันทึกใบสั่งซื้อ',
        isLoading: false,
      });
      throw err;
    }
  },

  updatePurchaseOrder: async (id, payload) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updatePurchaseOrderRequest(id, payload);
      set({ isLoading: false });
      return updated;
    } catch (err) {
      set({
        error: err.message || 'เกิดข้อผิดพลาดระหว่างอัปเดตใบสั่งซื้อ',
        isLoading: false,
      });
      throw err;
    }
  },

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
      const updatedCart = [...state.cartItems];

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
        item.productId === productId
          ? { ...item, quantity: Math.max(1, Number(quantity)) }
          : item
      ),
    }));
    get().recalculate();
  },

  updateCartDiscount: (productId, discountAmount) => {
    set((state) => ({
      cartItems: state.cartItems.map((item) =>
        item.productId === productId
          ? { ...item, discountAmount: Math.max(0, Number(discountAmount)) }
          : item
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
  },
}));
