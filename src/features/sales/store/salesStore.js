// 📁 FILE: features/sales/store/salesStore.js

import { create } from 'zustand';
import { createSaleOrder, getAllSales, getSaleById, returnSale } from '../api/saleApi';

import { searchStockItem } from '@/features/stockItem/api/stockItemApi';
import { markSaleAsPaid } from '../api/saleApi';

const useSalesStore = create((set, get) => ({
  saleItems: [],
  customerId: null,
  sales: [],
  currentSale: null,

  addSaleItemAction: (item) => {
    set((state) => ({ saleItems: [...state.saleItems, item] }));
  },

  removeSaleItemAction: (barcode) => {
    set((state) => ({ saleItems: state.saleItems.filter(i => i.barcode !== barcode) }));
  },

  clearSaleItemsAction: () => {
    set({ saleItems: [], customerId: null });
  },

  setCustomerIdAction: (id) => set({ customerId: id }),

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
        paymentMethod: 'CASH',
        paymentDetails: '',
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

      return data; // ✅ ส่งข้อมูลทั้งก้อนที่รวม branch, items, customer ฯลฯ
    } catch (err) {
      console.error('❌ [confirmSaleOrderAction]', err);
      return { error: 'เกิดข้อผิดพลาดในการขาย' };
    }
  },

  searchStockItemAction: async (barcode) => {
    try {
      const results = await searchStockItem(barcode);
      const stockItem = results[0];
      if (!stockItem) return null;

      return {
        barcode: stockItem.barcode,
        barcodeId: stockItem.id,
        productName: stockItem.product?.name || 'ไม่พบชื่อสินค้า',
        price: stockItem.sellPrice ?? 0,
        productId: stockItem.productId,
        stockItemId: stockItem.id,
        status: stockItem.status,
        categoryId: stockItem.product?.categoryId ?? null,
        templateId: stockItem.product?.templateId ?? null,
        warrantyDays: stockItem.warrantyDays ?? null,
      };
    } catch (err) {
      console.error('[searchStockItemAction]', err);
      return null;
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