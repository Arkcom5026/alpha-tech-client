// src/features/barcode/api/barcodeApi.js

import apiClient from '@/utils/apiClient';

// ✅ POST: สร้างบาร์โค้ดที่ยังไม่ได้สร้างสำหรับใบรับสินค้านี้
export const generateMissingBarcodes = async (receiptId) => {
  if (!receiptId) throw new Error('Missing receiptId');
  const res = await apiClient.post(`/barcodes/generate-missing/${receiptId}`);
  return res.data;
};

// ✅ GET: ดึงบาร์โค้ดทั้งหมดจากใบรับสินค้าที่ระบุ
export const getBarcodesByReceiptId = async (receiptId) => {
  if (!receiptId) throw new Error('Missing receiptId');
  const res = await apiClient.get(`/barcodes/by-receipt/${receiptId}`);
  return res.data;  
};

// ✅ GET: ดึงใบตรวจรับที่มีการสร้างบาร์โค้ดแล้วเท่านั้น
export const getReceiptsWithBarcodes = async () => {
  const res = await apiClient.get('/barcodes/with-barcodes');
  return res.data;
};

// ✅ ยิงบาร์โค้ดเพื่อรับสินค้าเข้าสต๊อก
export const receiveStockItem = async (barcode) => {
  if (!barcode) throw new Error('Missing barcode');
  const res = await apiClient.post('/stock-items/receive-sn', { barcode });
  return res.data;
};


export const updateSerialNumber = async (barcode, serialNumber) => {
  const res = await apiClient.patch(`/stock-items/update-sn/${barcode}`, { serialNumber });
  return res.data;
};
