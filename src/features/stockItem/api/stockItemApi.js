// ✅ stockItemApi.js — เรียก API ที่เกี่ยวกับ StockItem (SN / Barcode)

import apiClient from '@/utils/apiClient';

// POST: เพิ่ม SN เข้า stock จากใบรับสินค้า
export const addStockItem = async (data) => {
  try {
    const res = await apiClient.post('/stock-items', data);
    return res.data;
  } catch (error) {
    console.error('[api] addStockItem error:', error);
    throw error;
  }
};

// GET: ดึงรายการ StockItem ทั้งหมดจาก receiptId
export const getStockItemsByReceipt = async (receiptId) => {
  try {
    const res = await apiClient.get(`/stock-items/by-receipt/${receiptId}`);
    return res.data;
  } catch (error) {
    console.error('[api] getStockItemsByReceipt error:', error);
    throw error;
  }
};

// DELETE: ลบ SN จากสต๊อก (ใช้ publicId หรือ stockItemId)
export const deleteStockItem = async (stockItemId) => {
  try {
    const res = await apiClient.delete(`/stock-items/${stockItemId}`);
    return res.data;
  } catch (error) {
    console.error('[api] deleteStockItem error:', error);
    throw error;
  }
};

// PATCH: อัปเดตสถานะ SN (เช่น SOLD, CLAIMED, LOST, USED)
export const updateStockItemStatus = async ({ stockItemId, status }) => {
  try {
    const res = await apiClient.patch(`/stock-items/${stockItemId}/status`, { status });
    return res.data;
  } catch (error) {
    console.error('[api] updateStockItemStatus error:', error);
    throw error;
  }
};

// GET: ดึงรายการ SN ทั้งหมดของสินค้าใดสินค้าหนึ่ง
export const getStockItemsByProduct = async (productId) => {
  try {
    const res = await apiClient.get(`/stock-items/by-product/${productId}`);
    return res.data;
  } catch (error) {
    console.error('[api] getStockItemsByProduct error:', error);
    throw error;
  }
};

// GET: ดึงรายการ SN ที่พร้อมพิมพ์บาร์โค้ดทั้งหมด
export const getStockItemsForBarcodePrint = async () => {
  try {
    const res = await apiClient.get('/stock-items/for-barcode-print');
    return res.data;
  } catch (error) {
    console.error('[api] getStockItemsForBarcodePrint error:', error);
    throw error;
  }
};
