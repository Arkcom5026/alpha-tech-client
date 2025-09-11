// 📁 FILE: features/sales/store/salesStore.js

import { create } from 'zustand';

import {
  createSaleOrder,
  getAllSales,
  getSaleById,
  returnSale,
  markSaleAsPaid,
  searchPrintableSales,
  convertOrderOnlineToSale
} from '../api/saleApi';

const useSalesStore = create((set, get) => ({
  saleItems: [],
  customerId: null,
  sales: [],
  currentSale: null,
  printableSales: [],

  paymentList: [
    { method: 'CASH', amount: 0 },
    { method: 'TRANSFER', amount: 0 },
    { method: 'CREDIT', amount: 0 },
    { method: 'DEPOSIT', amount: 0 },
  ],

  cardRef: '',
  billDiscount: 0,
  sharedBillDiscountPerItem: 0,
  saleCompleted: false,

  setSaleCompleted: (val) => set({ saleCompleted: val }),

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

  // ✅ ปรับการเฉลี่ยส่วนลดบิลแบบ Largest Remainder
  setBillDiscount: (amount) => {
    // ✅ แจกส่วนลดบิลแบบสัดส่วน + Largest Remainder ให้ผลรวมตรง billDiscount เป๊ะ
    const billDiscount = Number(amount) || 0;
    const { saleItems } = get();
    if (!saleItems.length) {
      set({ billDiscount, sharedBillDiscountPerItem: 0 });
      return;
    }

    const totalPrice = saleItems.reduce((sum, i) => sum + (Number(i.price) || 0), 0);
    if (totalPrice <= 0) {
      // ไม่มีราคาตั้งต้น แจกไม่ได้
      set({ billDiscount, sharedBillDiscountPerItem: 0 });
      return;
    }

    // คำนวณส่วนลดต่อรายการแบบทศนิยม
    const provisional = saleItems.map((item) => {
      const baseDiscount = Number(item.discountWithoutBill ?? item.discount ?? 0) || 0;
      const ratio = (Number(item.price) || 0) / totalPrice;
      const rawShare = billDiscount * ratio; // ทศนิยม
      const floorShare = Math.floor(rawShare);
      const frac = rawShare - floorShare;
      return { item, baseDiscount, floorShare, frac };
    });

    // รวม floor แล้วหา remainder ที่ต้องแจกเพิ่มทีละ 1
    const floorSum = provisional.reduce((s, x) => s + x.floorShare, 0);
    let remainder = billDiscount - floorSum;

    // เรียงตามเศษมาก→น้อย เพื่อแจก remainder ให้รายการที่มีเศษมากที่สุดก่อน
    const order = [...provisional].sort((a, b) => b.frac - a.frac);
    const n = order.length;
    const bonusMap = new Map();
    let i = 0;
    while (remainder > 0 && n > 0) {
      const key = order[i % n].item.stockItemId;
      bonusMap.set(key, (bonusMap.get(key) || 0) + 1);
      remainder -= 1;
      i += 1;
    }

    const newItems = provisional.map(({ item, baseDiscount, floorShare }) => {
      const bonus = bonusMap.get(item.stockItemId) || 0;
      const billShare = floorShare + bonus;
      return {
        ...item,
        discount: baseDiscount + billShare,
        discountWithoutBill: baseDiscount,
        billShare,
      };
    });

    const shared = Math.floor(billDiscount / saleItems.length);
    set({ billDiscount, saleItems: newItems, sharedBillDiscountPerItem: shared });
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

  receivedAmount: () => get().sumPaymentList(),
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

  // ✅ ส่ง saleMode ให้ BE จัดการสถานะเอง
  confirmSaleOrderAction: async (saleMode) => {
    const { saleItems, customerId } = get();
    if (saleMode === 'CREDIT' && !customerId) {
      return { error: 'การขายแบบเครดิตต้องเลือกชื่อลูกค้าก่อน' };
    }
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
        items: saleItems
          .filter(item => !!item.stockItemId && !!item.barcodeId)
          .map((item) => ({
            stockItemId: item.stockItemId,
            barcodeId: item.barcodeId,
            basePrice: item.price,
            vatAmount: Math.round(((item.price - (item.discount ?? 0)) * vatRate) / 100),
            price: item.price - (item.discount ?? 0),
            discount: item.discount ?? 0,
            remark: '',
          })),
        saleMode,
      };

      const data = await createSaleOrder(payload);
      set({
        saleItems: [],
        customerId: null,
        paymentList: [
          { method: 'CASH', amount: 0 },
          { method: 'TRANSFER', amount: 0 },
          { method: 'CREDIT', amount: 0 },
          { method: 'DEPOSIT', amount: 0 },
        ],
      });
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

  setCurrentSale: (saleData) => set({ currentSale: saleData }),

  getSaleByIdAction: async (id) => {
    try {
      const data = await getSaleById(id);
      set({ currentSale: data });
    } catch (err) {
      console.error('[getSaleByIdAction]', err);
      set({ currentSale: null });
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

  resetSaleOrderAction: () => {
    set({
      saleItems: [],
      paymentList: [
        { method: 'CASH', amount: 0 },
        { method: 'TRANSFER', amount: 0 },
        { method: 'CREDIT', amount: 0 },
        { method: 'DEPOSIT', amount: 0 },
      ],
      billDiscount: 0,
      sharedBillDiscountPerItem: 0,
      cardRef: '',
      customerId: null,
    });
  },

  loadPrintableSalesAction: async (params = {}) => {
    try {
      const data = await searchPrintableSales({
        fromDate: params.fromDate,
        toDate: params.toDate,
        keyword: params.keyword || '',
        limit: params.limit || 100,
        _ts: Date.now(),
      });
      set({ printableSales: data });
    } catch (error) {
      console.error('❌ [loadPrintableSalesAction] error:', error);
      set({ printableSales: [] });
    }
  },

  convertOrderOnlineToSaleAction: async (orderOnlineId, stockSelections) => {
    try {
      const res = await convertOrderOnlineToSale(orderOnlineId, stockSelections);
      return res;
    } catch (err) {
      console.error('❌ [convertOrderOnlineToSaleAction]', err);
      throw err;
    }
  },
}));

export default useSalesStore;
