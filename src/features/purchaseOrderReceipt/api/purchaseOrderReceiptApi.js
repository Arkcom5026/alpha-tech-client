// ✅ purchaseOrderReceiptApi.js — API ฝั่งใบรับสินค้า (ESM)
import apiClient from '@/utils/apiClient';

// 🔎 ดึงใบรับสินค้าทั้งหมด (รองรับกรอง printed แบบ optional)
export const getAllReceipts = async (params = {}) => {
  try {
    const { data } = await apiClient.get('/purchase-order-receipts', { params });
    console.log("getAllReceipts :",data )
    return data;
  } catch (error) {
    console.error('❌ getAllReceipts error:', error);
    throw error;
  }
};

export const getReceiptById = async (id) => {
  try {
    const { data } = await apiClient.get(`/purchase-order-receipts/${id}`);
    return data;
  } catch (error) {
    console.error('❌ getReceiptById error:', error);
    throw error;
  }
};

export const getReceiptItemsByReceiptId = async (receiptId) => {
  try {
    const { data } = await apiClient.get(`/purchase-order-receipts/${receiptId}/items`);
    return data;
  } catch (error) {
    console.error('❌ getReceiptItemsByReceiptId error:', error);
    throw error;
  }
};

export const createReceipt = async (payload) => {
  try {
    const { data } = await apiClient.post('/purchase-order-receipts', payload);
    return data;
  } catch (error) {
    console.error('❌ createReceipt error:', error);
    throw error;
  }
};

export const updateReceipt = async (id, payload) => {
  try {
    const { data } = await apiClient.patch(`/purchase-order-receipts/${id}`, payload);
    return data;
  } catch (error) {
    console.error('❌ updateReceipt error:', error);
    throw error;
  }
};

export const deleteReceipt = async (id) => {
  try {
    const { data } = await apiClient.delete(`/purchase-order-receipts/${id}`);
    return data;
  } catch (error) {
    console.error('❌ deleteReceipt error:', error);
    throw error;
  }
};

// 🚦 สรุปบาร์โค้ดตามใบรับ (ใช้ในโหมดพิมพ์แบบเก่า)
export const getReceiptBarcodeSummaries = async (params = {}) => {
  try {
    const { data } = await apiClient.get('/purchase-order-receipts/receipt-barcode-summaries', { params });
    return data;
  } catch (error) {
    console.error('❌ getReceiptBarcodeSummaries error:', error);
    throw error;
  }
};

// 🧾 ใบรับสินค้าที่พร้อมชำระ
export const getReceiptsReadyToPay = async (params = {}) => {
  try {
    const { data } = await apiClient.get('/purchase-order-receipts/ready-to-pay', { params });
    return data;
  } catch (error) {
    console.error('❌ getReceiptsReadyToPay error:', error);
    throw error;
  }
};

// ✅ ทำเครื่องหมายว่ารับของครบ/จบใบรับ
export const markReceiptAsCompleted = async (receiptId) => {
  try {
    const { data } = await apiClient.patch(`/purchase-order-receipts/${receiptId}/complete`);
    return data;
  } catch (error) {
    console.error('❌ markReceiptAsCompleted error:', error);
    throw error;
  }
};

// ✅ Finalize ถ้าจำเป็น (เช็คและปิดสถานะ)
export const finalizeReceiptIfNeeded = async (receiptId) => {
  try {
    const { data } = await apiClient.patch(`/purchase-order-receipts/${receiptId}/finalize`);
    return data;
  } catch (error) {
    console.error('❌ finalizeReceiptIfNeeded error:', error);
    throw error;
  }
};

// 🖨️ ทำเครื่องหมายว่า "พิมพ์แล้ว"
export const markReceiptAsPrinted = async (receiptId) => {
  try {
    const { data } = await apiClient.patch(`/purchase-order-receipts/${receiptId}/printed`);
    return data;
  } catch (error) {
    console.error('❌ markReceiptAsPrinted error:', error);
    throw error;
  }
};

// 🧮 (ออปชัน) ดึง "สรุปใบรับ" โดยตรงจาก API หากมี endpoint พร้อม
// หาก Back-end รองรับ endpoint นี้ คุณสามารถสลับ Store มาใช้ตัวนี้แทนการ normalize ฝั่ง FE ได้ทันที
export const getReceiptSummaries = async (params = {}) => {
  try {
    const { data } = await apiClient.get('/purchase-order-receipts/summaries', { params });
    // คาดหวังรูปแบบ: [{id, code, purchaseOrderCode, supplier, taxInvoiceNo, receivedAt, totalItems, scannedCount, printed}]
    return data;
  } catch (error) {
    console.error('❌ getReceiptSummaries error:', error);
    throw error;
  }
};
