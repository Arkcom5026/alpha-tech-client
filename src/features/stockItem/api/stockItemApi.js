// ✅ stockItemApi.js — API สำหรับรับ SN และค้นหาด้วย query
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

// 🔍 ค้นหาสินค้าพร้อมขายด้วย query (barcode, title, หรือรหัสสินค้า)
export const searchStockItem = async (query) => {
  if (!query) throw new Error('กรุณาระบุคำค้นหา');

  const res = await apiClient.get(`/stock-items/search?query=${encodeURIComponent(query)}`);
  return res.data;
};
