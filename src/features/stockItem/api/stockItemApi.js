// ✅ stockItemApi.js — API สำหรับรับ SN และค้นหาด้วย query
import apiClient from '@/utils/apiClient';

// 🔁 รับ SN เข้าสต๊อก
export const receiveStockItem = async ({ barcode, receiptItemId }) => {
  try {
    if (!barcode || !receiptItemId) throw new Error('ข้อมูลไม่ครบถ้วน');

    const res = await apiClient.post('/stock-items/receive-sn', {
      barcode,
      receiptItemId,
    });

    return res.data;
  } catch (err) {
    console.error('❌ receiveStockItem error:', err);
    throw err;
  }
};

// 🔍 ค้นหาสินค้าพร้อมขายด้วย query (barcode, title, หรือรหัสสินค้า)
export const searchStockItem = async (query) => {
  try {
    if (!query) throw new Error('กรุณาระบุคำค้นหา');

    const res = await apiClient.get(`/stock-items/search?query=${encodeURIComponent(query)}`);
    return res.data;
  } catch (err) {
    console.error('❌ searchStockItem error:', err);
    throw err;
  }
};

// ✅ อัปเดตสถานะ stockItem เป็น SOLD แบบ batch update
export const markStockItemsAsSold = async (stockItemIds) => {
  try {
    await apiClient.patch('/stock-items/mark-sold', {
      stockItemIds, // ✅ ต้องเป็น array เช่น ['xxx', 'yyy']
    });
  } catch (err) {
    console.error('❌ markStockItemsAsSold error:', err);
    throw err;
  }
};


