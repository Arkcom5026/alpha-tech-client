// 📁 FILE: features/sales/store/salesStore.js
// ✅ COMMENT: บังคับให้ทุกคำสั่งขายต้องมี customerId ก่อนยืนยัน

import { create } from 'zustand';
import apiClient from '@/utils/apiClient';

const useSalesStore = create((set, get) => ({
  saleItems: [],
  customerId: null,

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
      alert('ยังไม่มีรายการสินค้า');
      return;
    }

    if (!customerId) {
      alert('กรุณากรอกเบอร์โทรลูกค้าก่อนทำการขาย');
      return;
    }

    try {
      const res = await apiClient.post('/sale-orders', {
        items: saleItems,
        customerId,
      });

      alert(`✅ ขายสินค้าสำเร็จ: ${res.data.code}`);
      set({ saleItems: [], customerId: null });
    } catch (err) {
      console.error('❌ [confirmSaleOrderAction]', err);
      alert('เกิดข้อผิดพลาดในการขาย');
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
  
}));

export default useSalesStore;


