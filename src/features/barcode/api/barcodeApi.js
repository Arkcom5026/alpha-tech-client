// src/features/barcode/api/barcodeApi.js

import apiClient from '@/utils/apiClient';

// ✅ POST: สร้างบาร์โค้ดที่ยังไม่ได้สร้างสำหรับใบรับสินค้านี้
export const generateMissingBarcodes = async (receiptId) => {
  if (!receiptId) throw new Error('Missing receiptId');
  try {
    const res = await apiClient.post(`/barcodes/generate-missing/${receiptId}`);
    return res.data;
  } catch (err) {
    console.error('❌ generateMissingBarcodes error:', err);
    throw err;
  }
};

// ✅ GET: ดึงบาร์โค้ดทั้งหมดจากใบรับสินค้าที่ระบุ
export const getBarcodesByReceiptId = async (receiptId) => {
  if (!receiptId) throw new Error('Missing receiptId');
  try {
    const res = await apiClient.get(`/barcodes/by-receipt/${receiptId}`);
    return res.data;  
  } catch (err) {
    console.error('❌ getBarcodesByReceiptId error:', err);
    throw err;
  }
};

// ✅ GET: ดึงใบตรวจรับที่มีการสร้างบาร์โค้ดแล้วเท่านั้น
export const getReceiptsWithBarcodes = async () => {
  try {
    const res = await apiClient.get('/barcodes/with-barcodes');
    return res.data;
  } catch (err) {
    console.error('❌ getReceiptsWithBarcodes error:', err);
    throw err;
  }
};

// ✅ ยิงบาร์โค้ดเพื่อรับสินค้าเข้าสต๊อก
export const receiveStockItem = async (barcode) => {
  if (!barcode) throw new Error('Missing barcode');
  try {
    const res = await apiClient.post('/stock-items/receive-sn', { barcode });
    return res.data;
  } catch (err) {
    console.error('❌ receiveStockItem error:', err);
    throw err;
  }
};

export const updateSerialNumber = async (barcode, serialNumber) => {
  try {
    const res = await apiClient.patch(`/stock-items/update-sn/${barcode}`, { serialNumber });
    return res.data;
  } catch (err) {
    console.error('❌ updateSerialNumber error:', err);
    throw err;
  }
};

// ✅ PATCH: อัปเดตสถานะว่าพิมพ์บาร์โค้ดแล้ว
export const markBarcodesAsPrinted = async (purchaseOrderReceiptId) => {
  console.log('purchaseOrderReceiptId : ', purchaseOrderReceiptId);
  if (!purchaseOrderReceiptId) throw new Error('Missing purchaseOrderReceiptId');
  try {
    const res = await apiClient.patch(`/barcodes/mark-printed`,  purchaseOrderReceiptId );
    return res.data;
  } catch (err) {
    console.error('❌ markBarcodesAsPrinted error:', err);
    throw err;
  }
};








