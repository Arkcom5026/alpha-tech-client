// ✅ stockItemApi.js — API สำหรับรับ SN เข้าสต๊อก
import apiClient from '@/utils/apiClient';

// 🔁 รับ SN เข้าสต๊อก
export const receiveStockItem = async ({ barcode, receiptItemId }) => {
  if (!barcode || !receiptItemId) throw new Error('ข้อมูลไม่ครบถ้วน');

  const res = await apiClient.post('/stock-items/receive-sn', {
    barcode,
    receiptItemId,
  });

  return res.data;
};
