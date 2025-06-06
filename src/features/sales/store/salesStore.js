// 📁 FILE: features/sales/store/salesStore.js

import { create } from 'zustand';
import apiClient from '@/utils/apiClient';

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

  confirmSaleOrderAction: async () => {
    const { saleItems, customerId } = get();

    if (saleItems.length === 0) {
      return { error: 'ยังไม่มีรายการสินค้า' };
    }

    try {
      // คำนวณยอดรวมก่อนส่ง
      const vatRate = 7;
      const totalBeforeDiscount = saleItems.reduce((sum, item) => sum + item.price, 0);
      const totalDiscount = saleItems.reduce((sum, item) => sum + (item.discount ?? 0), 0);
      const totalNet = totalBeforeDiscount - totalDiscount;
      const vatAmount = Math.round((totalNet * vatRate) / 100);
      const totalAmount = totalNet + vatAmount;

      const payload = {
        customerId,
        employeeId: 'mock-employee-id', // TODO: ดึงจาก auth store จริง
        branchId: 'mock-branch-id',     // TODO: ดึงจาก auth store จริง
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
          barcodeId: item.barcodeId, // ✅ เพิ่ม barcodeId เพื่อให้ backend ตรวจสอบได้
          basePrice: item.price,
          vatAmount: Math.round(((item.price - (item.discount ?? 0)) * vatRate) / 100),
          price: item.price - (item.discount ?? 0),
          discount: item.discount ?? 0,
          remark: '',
        })),
      };

      const res = await apiClient.post('/sale-orders', payload);

      set({ saleItems: [], customerId: null });
      return { message: `✅ ขายสินค้าสำเร็จ: ${res.data.code}`, code: res.data.code };
    } catch (err) {
      console.error('❌ [confirmSaleOrderAction]', err);
      return { error: 'เกิดข้อผิดพลาดในการขาย' };
    }
  },

  searchStockItemAction: async (barcode) => {
    try {
      const res = await apiClient.get(`/stock-items/search?barcode=${barcode}`);
      const stockItem = res.data[0];
      if (!stockItem) return null;

      return {
        barcode: stockItem.barcode,
        barcodeId: stockItem.id,
        productName: stockItem.product?.title || 'ไม่พบชื่อสินค้า',
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
      const res = await apiClient.get('/sale-orders');
      set({ sales: res.data });
    } catch (err) {
      console.error('[loadSalesAction]', err);
    }
  },

  getSaleByIdAction: async (id) => {
    try {
      const res = await apiClient.get(`/sale-orders/${id}`);
      set({ currentSale: res.data });
    } catch (err) {
      console.error('[getSaleByIdAction]', err);
    }
  },

  returnSaleAction: async (saleOrderId, saleItemId) => {
    try {
      const res = await apiClient.post(`/sale-orders/${saleOrderId}/return`, {
        saleItemId,
      });
      return res.data;
    } catch (err) {
      console.error('[returnSaleAction]', err);
      return { error: 'เกิดข้อผิดพลาดในการคืนสินค้า' };
    }
  },

}));
   
export default useSalesStore;
