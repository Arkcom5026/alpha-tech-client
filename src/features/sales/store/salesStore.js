// 📁 FILE: features/sales/store/salesStore.js

import { create } from 'zustand';
import { createSaleOrder, getAllSales, getSaleById, returnSale, updateCustomer } from '../api/saleApi';
import { markSaleAsPaid } from '../api/saleApi';

const useSalesStore = create((set, get) => ({
  saleItems: [],
  customerId: null,
  sales: [],
  currentSale: null,

  // 💵 💳 💸 💶 💲 💴 💰 💷
  paymentList: [
    { method: 'CASH', amount: 0 },
    { method: 'TRANSFER', amount: 0 },
    { method: 'CREDIT', amount: 0 },
    { method: 'DEPOSIT', amount: 0 },
  ],
  cardRef: '',
  billDiscount: 0,
  sharedBillDiscountPerItem: 0,

  setPaymentAmount: (method, amount) => {
    set((state) => {
      const exists = state.paymentList.some(p => p.method === method);
      const newList = exists
        ? state.paymentList.map((p) =>
            p.method === method ? { ...p, amount: Number(amount) || 0 } : p
          )
        : [...state.paymentList, { method, amount: Number(amount) || 0, note: '' }];

      return { paymentList: newList };
    });
  },

  setBillDiscount: (amount) => {
    const discount = Number(amount) || 0;
    const { saleItems } = get();
    const totalPrice = saleItems.reduce((sum, i) => sum + i.price, 0);

    const newItems = saleItems.map((item) => {
      const baseDiscount = item.discountWithoutBill ?? item.discount ?? 0;
      const ratio = item.price / totalPrice;
      const billShare = Math.round(discount * ratio);

      return {
        ...item,
        discount: baseDiscount + billShare,
        discountWithoutBill: baseDiscount,
        billShare: billShare,
      };
    });

    const shared = saleItems.length > 0 ? Math.floor(discount / saleItems.length) : 0;

    set({
      billDiscount: discount,
      saleItems: newItems,
      sharedBillDiscountPerItem: shared,
    });
  },

  setSharedBillDiscountPerItem: () => {
    const { billDiscount, saleItems } = get();
    const shared = saleItems.length > 0 ? Math.floor(billDiscount / saleItems.length) : 0;
    set({ sharedBillDiscountPerItem: shared });
  },

  sumPaymentList: () => {
    const list = get().paymentList || [];
    return list.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  },

  finalPrice: () => {
    const base = get().saleItems.reduce((sum, i) => sum + i.price - (i.discount ?? 0), 0);
    return Math.max(base, 0);
  },

  receivedAmount: () => {
    return get().sumPaymentList();
  },

  changeAmount: () => {
    const totalPaid = get().sumPaymentList();
    const final = get().finalPrice();
    return Math.max(totalPaid - final, 0);
  },

  setCardRef: (val) => set({ cardRef: val }),

  setCustomerIdAction: (id) => set({ customerId: id }),

  addSaleItemAction: (item) => {
    set((state) => {
      const exists = state.saleItems.some((i) => i.stockItemId === item.stockItemId);
      if (exists) return state;
      return { saleItems: [...state.saleItems, item] };
    });
  },

  removeSaleItemAction: (stockItemId) => {
    set((state) => ({
      saleItems: state.saleItems.filter((i) => i.stockItemId !== stockItemId),
    }));
  },

  clearSaleItemsAction: () => {
    set({ saleItems: [], customerId: null });
  },

  updateItemDiscountAction: (stockItemId, discount) => {
    set((state) => ({
      saleItems: state.saleItems.map((item) =>
        item.stockItemId === stockItemId
          ? { ...item, discount: Number(discount) || 0 }
          : item
      ),
    }));
  },

  updateSaleItemAction: (stockItemId, newData) => {
    set((state) => ({
      saleItems: state.saleItems.map((item) =>
        item.stockItemId === stockItemId
          ? { ...item, ...newData }
          : item
      ),
    }));
  },

  markSalePaidAction: async (saleId) => {
    try {
      await markSaleAsPaid(saleId);
    } catch (err) {
      console.error('❌ [markSalePaidAction]', err);
    }
  },

  confirmSaleOrderAction: async () => {
    const { saleItems, customerId } = get();

    if (saleItems.length === 0) {
      return { error: 'ยังไม่มีรายการสินค้า' };
    }

    try {
      const vatRate = 7;
      const totalBeforeDiscount = saleItems.reduce((sum, item) => sum + item.price, 0);
      const totalDiscount = saleItems.reduce((sum, item) => sum + (item.discount ?? 0), 0);
      const totalNet = totalBeforeDiscount - totalDiscount;
      const vatAmount = Math.round((totalNet * vatRate) / 100);
      const totalAmount = totalNet + vatAmount;

      const payload = {
        customerId,
        totalBeforeDiscount,
        totalDiscount,
        vat: vatAmount,
        vatRate,
        totalAmount,
        note: '',
        items: saleItems.map((item) => ({
          stockItemId: item.stockItemId,
          barcodeId: item.barcodeId,
          basePrice: item.price,
          vatAmount: Math.round(((item.price - (item.discount ?? 0)) * vatRate) / 100),
          price: item.price - (item.discount ?? 0),
          discount: item.discount ?? 0,
          remark: '',
        })),
      };

      const data = await createSaleOrder(payload);

      set({ saleItems: [], customerId: null });

      return data;
    } catch (err) {
      console.error('❌ [confirmSaleOrderAction]', err);
      return { error: 'เกิดข้อผิดพลาดในการขาย' };
    }
  },


  loadSalesAction: async () => {
    try {
      const data = await getAllSales();
      set({ sales: data });
    } catch (err) {
      console.error('[loadSalesAction]', err);
    }
  },

  getSaleByIdAction: async (id) => {
    try {
      const data = await getSaleById(id);
      set({ selectedSale: data });
    } catch (err) {
      console.error('[getSaleByIdAction]', err);
    }
  },

  returnSaleAction: async (saleOrderId, saleItemId) => {
    try {
      const data = await returnSale(saleOrderId, saleItemId);
      return data;
    } catch (err) {
      console.error('[returnSaleAction]', err);
      return { error: 'เกิดข้อผิดพลาดในการคืนสินค้า' };
    }
  },
}));

export default useSalesStore;


