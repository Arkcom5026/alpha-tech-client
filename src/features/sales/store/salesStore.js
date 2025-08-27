// 📁 FILE: features/sales/store/salesStore.js

import { create } from 'zustand';

// ✅ เพิ่ม searchPrintableSales เข้ามาใน import

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

  currentSale: null, // ตรวจสอบให้แน่ใจว่ามี state นี้

  // ✅ เพิ่ม state สำหรับเก็บข้อมูลใบขายที่สามารถพิมพ์ได้

  printableSales: [],

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


  // ✨ แก้ไข: เพิ่ม saleMode ('CASH' หรือ 'CREDIT') เข้ามาเป็นพารามิเตอร์

  confirmSaleOrderAction: async (saleMode) => {

    const { saleItems, customerId } = get();

    if (saleMode === 'CREDIT' && !customerId) {
      return { error: 'การขายแบบเครดิตต้องเลือกชื่อลูกค้าก่อน' };
    }

    if (saleItems.length === 0) {

      return { error: 'ยังไม่มีรายการสินค้า' };

    }

    try {
      console.log('[🔍 DEBUG] saleItems', saleItems);
      console.log('[🔍 DEBUG] barcodeId ในแต่ละรายการ', saleItems.map(i => i.barcodeId));

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
          .filter(item => !!item.stockItemId && !!item.barcodeId) // ✅ กรองรายการที่ไม่สมบูรณ์
          .map((item) => ({
            stockItemId: item.stockItemId,
            barcodeId: item.barcodeId,
            basePrice: item.price,
            vatAmount: Math.round(((item.price - (item.discount ?? 0)) * vatRate) / 100),
            price: item.price - (item.discount ?? 0),
            discount: item.discount ?? 0,
            remark: '',
          })),

        // ✨ เพิ่มข้อมูลสำคัญสำหรับแยกประเภทการขาย

        isCredit: saleMode === 'CREDIT',

        status: saleMode === 'CREDIT' ? 'DELIVERED' : 'COMPLETED',

        paid: saleMode !== 'CREDIT',

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

  // ✅ เพิ่ม action นี้เพื่อตั้งค่า currentSale โดยตรง
  setCurrentSale: (saleData) => set({ currentSale: saleData }),


  getSaleByIdAction: async (id) => {

    try {

      const data = await getSaleById(id);

      set({ currentSale: data }); // อัปเดต currentSale เมื่อดึงข้อมูลจาก Backend

    } catch (err) {

      console.error('[getSaleByIdAction]', err);

      set({ currentSale: null }); // เคลียร์ currentSale หากเกิดข้อผิดพลาด

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


  loadPrintableSalesAction: async (params) => {

    try {

      const data = await searchPrintableSales(params);

      console.log('loadPrintableSalesAction data : ', data)

      set({ printableSales: data });

    } catch (error) {

      console.error('❌ [loadPrintableSalesAction] error:', error);

      // Handle error, e.g., set an error state or show a notification

      set({ printableSales: [] }); // Clear data on error

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

