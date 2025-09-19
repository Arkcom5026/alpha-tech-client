// ✅ stockItemApi.js — API สำหรับรับ SN และค้นหาด้วย query
import apiClient from '@/utils/apiClient';

// 🔁 รับ SN เข้าสต๊อก (รองรับทั้ง serialNumber และ barcode — คง backward compatible)
export const receiveStockItem = async ({ barcode, serialNumber, receiptItemId } = {}) => {
  try {
    // ✅ backward-compat: เดิมบางที่ส่งมาเป็น { serialNumber: sn } อย่างเดียว
    const code = barcode || serialNumber;
    if (!code) throw new Error('กรุณาระบุบาร์โค้ดที่ต้องการรับเข้าสต๊อก');

    // ส่งเป็นรูปแบบใหม่ (nested) แต่จะมี route adapter รับได้ทั้งแบบเก่า/ใหม่
    const payload = { barcode: { barcode: String(code) } };
    // ถ้า serialNumber ต่างจาก barcode ให้แนบไปด้วย (กรณี STRUCTURED ที่มี SN จริง)
    if (serialNumber && String(serialNumber) !== String(code)) {
      payload.barcode.serialNumber = String(serialNumber);
    }
    if (receiptItemId) payload.receiptItemId = receiptItemId; // ไม่บังคับ แต่เผื่อใช้ในอนาคต

    const res = await apiClient.post('/stock-items/receive-sn', payload);
    return res.data;
  } catch (err) {
    console.error('❌ receiveStockItem error:', err);
    const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'ไม่สามารถรับสินค้าเข้าสต๊อกได้';
    throw new Error(msg);
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

// ✅ ดึง stock item ที่พร้อมขาย (IN_STOCK) ตาม productId
export const getAvailableStockItemsByProduct = async (productId) => {
  try {
    if (!productId) throw new Error('productId ต้องไม่ว่าง');

    const res = await apiClient.get(`/stock-items/available`, {
      params: { productId },
    });
    return res.data;
  } catch (err) {
    console.error('❌ getAvailableStockItemsByProduct error:', err);
    throw err;
  }
};








