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
