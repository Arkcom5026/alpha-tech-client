// ✅ purchaseOrderReceiptApi.js — จัดการ API ของใบรับสินค้า + รายการในใบรับ

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

export const getReceiptBarcodeSummaries = async () => {
  try {
    const res = await apiClient.get('/purchase-order-receipts/with-barcode-status');
    return res.data;
  } catch (error) {
    console.error('📛 [getReceiptBarcodeSummaries] error:', error);
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

export const getReceiptItemsByReceiptId = async (receiptId) => {
  try {
    const res = await apiClient.get(`/purchase-order-receipt-items/by-receipt/${receiptId}`);
    return res.data;
  } catch (error) {
    console.error('📛 [getReceiptItemsByReceiptId] error:', error);
    throw error;
  }
};

export const markReceiptAsCompleted = async (receiptId) => {
  try {
    const res = await apiClient.patch(`/purchase-order-receipts/${receiptId}/complete`);
    return res.data;
  } catch (error) {
    console.error('📛 [markReceiptAsCompleted] error:', error);
    throw error;
  }
};

export const finalizeReceiptIfNeeded = async (receiptId) => {
  try {
    const res = await apiClient.patch(`/purchase-order-receipts/${receiptId}/finalize`);
    return res.data;
  } catch (error) {
    console.error('📛 [finalizeReceiptIfNeeded] error:', error);
    throw error;
  }
};

export const markReceiptAsPrinted = async (receiptId) => {
  try {
    const res = await apiClient.patch(`/purchase-order-receipts/${receiptId}/printed`);
    return res.data;
  } catch (error) {
    console.error('📛 [markReceiptAsPrinted] error:', error);
    throw error;
  }
};

export const getReceiptsReadyToPay = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.limit) params.append('limit', filters.limit);

    const res = await apiClient.get(`/purchase-order-receipts/ready-to-pay?${params.toString()}`);
    return res.data;
  } catch (error) {
    console.error('📛 [getReceiptsReadyToPay] error:', error);
    throw error;
  }
};
