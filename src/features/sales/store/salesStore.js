
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
  // ✅ global state for UI-based alert/error block (no dialog)
  loading: false,
  error: null,

  saleItems: [],
  customerId: null,
  sales: [],
  currentSale: null,
  printableSales: [],

  // ✅ last created sale id (for post-confirm flows like print bill)
  lastCreatedSaleId: null,
  setLastCreatedSaleIdAction: (id) => set({ lastCreatedSaleId: id || null }),

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
  clearErrorAction: () => set({ error: null }),
  setErrorAction: (msg) => set({ error: msg || null }),

  setPaymentAmount: (method, amount) => {
    set((state) => {
      const exists = state.paymentList.some((p) => p.method === method);
      const newList = exists
        ? state.paymentList.map((p) =>
            p.method === method ? { ...p, amount: Number(amount) || 0 } : p
          )
        : [...state.paymentList, { method, amount: Number(amount) || 0, note: '' }];
      return { paymentList: newList };
    });
  },

  // ✅ Alias ตามมาตรฐาน store (Action suffix) — backward compatible
  setPaymentAmountAction: (method, amount) => get().setPaymentAmount(method, amount),

  // ✅ ปรับการเฉลี่ยส่วนลดบิลแบบ Largest Remainder (หน่วยสตางค์) — ผลรวมตรง billDiscount เป๊ะ
  setBillDiscount: (amount) => {
    const billDiscount = Number(amount) || 0;
    const { saleItems } = get();

    if (!saleItems.length) {
      set({ billDiscount, sharedBillDiscountPerItem: 0 });
      return;
    }

    const totalPrice = saleItems.reduce((sum, i) => sum + (Number(i.price) || 0), 0);
    if (totalPrice <= 0) {
      set({ billDiscount, sharedBillDiscountPerItem: 0 });
      return;
    }

    const totalPriceSatang = Math.round(totalPrice * 100);
    const totalDiscSatang = billDiscount > 0 ? Math.round(billDiscount * 100) : 0;

    if (totalDiscSatang <= 0) {
      const newItems = saleItems.map((item) => {
        const baseDiscount = Number(item.discountWithoutBill ?? 0) || 0;
        return {
          ...item,
          billShare: 0,
          discountWithoutBill: baseDiscount,
          discount: baseDiscount,
        };
      });
      set({ billDiscount, saleItems: newItems, sharedBillDiscountPerItem: 0 });
      return;
    }

    const provisional = saleItems.map((item) => {
      const price = Number(item.price) || 0;
      const priceSatang = Math.max(0, Math.round(price * 100));
      const baseDiscount = Number(item.discountWithoutBill ?? 0) || 0;
      const raw = (totalDiscSatang * priceSatang) / totalPriceSatang;
      const flo = Math.floor(raw);
      const frac = raw - flo;
      return { item, baseDiscount, flo, frac };
    });

    let used = provisional.reduce((s, x) => s + x.flo, 0);
    let remain = Math.max(0, totalDiscSatang - used);

    const order = [...provisional].sort((a, b) => b.frac - a.frac);
    for (let i = 0; i < order.length && remain > 0; i += 1) {
      order[i].flo += 1;
      remain -= 1;
    }

    const floById = new Map(order.map((o) => [o.item.stockItemId, o.flo]));

    const newItems = provisional.map(({ item, baseDiscount, flo }) => {
      const finalFlo = floById.get(item.stockItemId) ?? flo;
      const billShare = finalFlo / 100;
      return {
        ...item,
        discountWithoutBill: baseDiscount,
        billShare,
        discount: baseDiscount + billShare,
      };
    });

    const avg = Math.floor((billDiscount / saleItems.length) * 100) / 100;
    set({ billDiscount, saleItems: newItems, sharedBillDiscountPerItem: avg });
  },

  // ✅ Alias ตามมาตรฐาน store (Action suffix) — backward compatible
  setBillDiscountAction: (amount) => get().setBillDiscount(amount),

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
    const base = get().saleItems.reduce(
      (sum, i) => sum + (Number(i.price) || 0) - (Number(i.discount ?? 0) || 0),
      0
    );
    return Math.max(base, 0);
  },

  receivedAmount: () => get().sumPaymentList(),
  changeAmount: () => {
    const totalPaid = get().sumPaymentList();
    const final = get().finalPrice();
    return Math.max(totalPaid - final, 0);
  },

  setCardRef: (val) => set({ cardRef: val }),
  setCardRefAction: (val) => get().setCardRef(val),
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
  // ✅ ส่ง saleMode ให้ BE จัดการสถานะเอง
  // Production hardening:
  // - เซ็ต loading/error ใน store เพื่อให้ UI แสดง error block ได้
  // - รองรับ backend 409 (ขายซ้ำ/สถานะไม่พร้อม/partial failure)
  confirmSaleOrderAction: async (saleMode) => {
    const { saleItems, customerId } = get();

    if (saleMode === 'CREDIT' && !customerId) {
      const msg = 'การขายแบบเครดิตต้องเลือกชื่อลูกค้าก่อน';
      set({ error: msg });
      return { error: msg };
    }
    if (saleItems.length === 0) {
      const msg = 'ยังไม่มีรายการสินค้า';
      set({ error: msg });
      return { error: msg };
    }

    set({ loading: true, error: null });

    try {
      const vatRate = 7;
      // ✅ คำนวณเงินแบบสตางค์ เพื่อความแม่นยำ
      const totalBeforeDiscountSatang = saleItems.reduce(
        (sum, item) => sum + Math.round((Number(item.price) || 0) * 100),
        0
      );
      const totalDiscountSatang = saleItems.reduce(
        (sum, item) => sum + Math.round((Number(item.discount) || 0) * 100),
        0
      );
      const totalNetSatang = Math.max(totalBeforeDiscountSatang - totalDiscountSatang, 0);
      const vatSatang = Math.round((totalNetSatang * vatRate) / 100);
      const totalAmountSatang = totalNetSatang + vatSatang;

      const totalBeforeDiscount = totalBeforeDiscountSatang / 100;
      const totalDiscount = totalDiscountSatang / 100;
      const totalNet = totalNetSatang / 100;
      const vatAmount = vatSatang / 100;
      const totalAmount = totalAmountSatang / 100;

      const payload = {
        customerId,
        totalBeforeDiscount,
        totalDiscount,
        vat: vatAmount,
        vatRate,
        totalAmount,
        note: '',
        items: saleItems
          .filter((item) => !!item.stockItemId && !!item.barcodeId)
          .map((item) => ({
            stockItemId: item.stockItemId,
            barcodeId: item.barcodeId,
            basePrice: Number(item.price) || 0,
            vatAmount:
              Math.round(
                (Math.max(
                  Math.round((Number(item.price) || 0) * 100) -
                    Math.round((Number(item.discount) || 0) * 100),
                  0
                ) *
                  vatRate) /
                  100
              ) / 100,
            price:
              Math.max(
                Math.round((Number(item.price) || 0) * 100) -
                  Math.round((Number(item.discount) || 0) * 100),
                0
              ) / 100,
            discount: Number(item.discount) || 0,
            remark: '',
          })),
        saleMode,
      };

      const data = await createSaleOrder(payload);

      // ✅ normalize saleId เพื่อให้ FE เปิดหน้า print ได้แน่นอน (รองรับ backend หลายรูปแบบ)
      const saleId =
        data?.saleId ??
        data?.id ??
        data?.saleOrderId ??
        data?.sale?.id ??
        null;

      set({
        saleItems: [],
        customerId: null,
        lastCreatedSaleId: saleId,
        paymentList: [
          { method: 'CASH', amount: 0 },
          { method: 'TRANSFER', amount: 0 },
          { method: 'CREDIT', amount: 0 },
          { method: 'DEPOSIT', amount: 0 },
        ],
      });

      return { saleId, data };
    } catch (err) {
      const status = err?.response?.status;
      const payload = err?.response?.data;

      // ✅ 409: ขายไม่ได้/ขายซ้ำ/สถานะเปลี่ยน (backend hardening)
      if (status === 409) {
        const msg = payload?.message || 'มีบางรายการไม่สามารถทำรายการขายได้ (อาจถูกขายไปแล้ว)';
        set({ error: msg });
        return { error: msg, code: payload?.code, details: payload };
      }

      // 400/401/500 ฯลฯ
      const msg = payload?.message || err?.message || 'เกิดข้อผิดพลาดในการขาย';
      console.error('❌ [confirmSaleOrderAction]', err);
      set({ error: msg });
      return { error: msg };
    } finally {
      set({ loading: false });
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
  setCurrentSaleAction: (saleData) => get().setCurrentSale(saleData),

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




