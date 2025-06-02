import apiClient from '@/utils/apiClient';

export const getAllReceipts = async () => {
  try {
    const res = await apiClient.get('/purchase-order-receipts');
    return res.data;
  } catch (error) {
    console.error('📛 [getAllReceipts] error:', error);
    throw error;
  }
};

export const getReceiptById = async (id) => {
  try {
    const res = await apiClient.get(`/purchase-order-receipts/${id}`);
    return res.data;
  } catch (error) {
    console.error('📛 [getReceiptById] error:', error);
    throw error;
  }
};

export const createReceipt = async (data) => {
  try {
    const res = await apiClient.post('/purchase-order-receipts', data);
    return res.data;
  } catch (error) {
    console.error('📛 [createReceipt] error:', error);
    throw error;
  }
};

export const updateReceipt = async (id, data) => {
  try {
    const res = await apiClient.put(`/purchase-order-receipts/${id}`, data);
    return res.data;
  } catch (error) {
    console.error('📛 [updateReceipt] error:', error);
    throw error;
  }
};

export const deleteReceipt = async (id) => {
  try {
    const res = await apiClient.delete(`/purchase-order-receipts/${id}`);
    return res.data;
  } catch (error) {
    console.error('📛 [deleteReceipt] error:', error);
    throw error;
  }
};

export const getEligiblePurchaseOrders = async () => {
  try {
    const res = await apiClient.get('/purchase-order-receipts?status=PENDING,PARTIAL');
    return res.data;
  } catch (error) {
    console.error('📛 [getEligiblePurchaseOrders] error:', error);
    throw error;
  }
};

// ✅ GET รายละเอียด PO แบบเต็ม (พร้อม supplier + รายการสินค้า + receiptItem)
export const getPurchaseOrderDetailById = async (poId) => {

    console.log('📦 [getPurchaseOrderDetailById] >> >> >>  id:', poId);

  try {
    
    const res = await apiClient.get(`/purchase-orders/${poId}`);
    return res.data;
  } catch (error) {
    console.error('📛 [getPurchaseOrderDetailById] error:', error);
    throw error;
  }
};

// ✅ GET ใบรับสินค้าพร้อมสรุปสถานะการยิง SN
export const getReceiptBarcodeSummaries = async () => {
  try {
    const res = await apiClient.get('/purchase-order-receipts/with-barcode-status');
    return res.data;
  } catch (error) {
    console.error('📛 [getReceiptBarcodeSummaries] error:', error);
    throw error;
  }
};
