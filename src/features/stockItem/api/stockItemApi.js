




// ✅ stockItemApi.js — API สำหรับรับ SN และค้นหาด้วย query
import apiClient from '@/utils/apiClient';

// 🔁 รับ SN เข้าสต๊อก (รองรับทั้ง serialNumber และ barcode — คง backward compatible)
export const receiveStockItem = async ({ barcode, serialNumber, receiptItemId, keepSN } = {}) => {
  try {
    const code = barcode || serialNumber;
    if (!code) throw new Error('กรุณาระบุบาร์โค้ดที่ต้องการรับเข้าสต๊อก');

    const payload = {
      barcode: {
        barcode: String(code),
      },
      keepSN: keepSN === true,
    };

    // ✅ ส่ง SN เฉพาะกรณีที่ต้องเก็บจริง
    if (keepSN === true && serialNumber && String(serialNumber) !== String(code)) {
      payload.barcode.serialNumber = String(serialNumber);
    }

    if (receiptItemId) payload.receiptItemId = receiptItemId;

    const res = await apiClient.post('/stock-items/receive-sn', payload);
    return res.data;
  } catch (err) {
    console.error('❌ receiveStockItem error:', err);
    const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'ไม่สามารถรับสินค้าเข้าสต๊อกได้';
    throw new Error(msg);
  }
};

// 🔍 ค้นหาสินค้าพร้อมขายด้วย query (barcode, title, หรือรหัสสินค้า)
// 🔐 รับสินค้าค้างรับทั้งหมดในครั้งเดียว (เฉพาะ non-SN flow)
export const receiveAllPendingNoSN = async ({ receiptId } = {}) => {
  try {
    const normalizedReceiptId = Number(receiptId);
    if (!Number.isFinite(normalizedReceiptId) || normalizedReceiptId <= 0) {
      throw new Error('receiptId ไม่ถูกต้อง');
    }

    const res = await apiClient.post('/stock-items/receive-all-no-sn', {
      receiptId: normalizedReceiptId,
    });
    return res.data;
  } catch (err) {
    console.error('❌ receiveAllPendingNoSN error:', err);
    const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'ไม่สามารถรับสินค้าค้างรับทั้งหมดได้';
    throw new Error(msg);
  }
};

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




