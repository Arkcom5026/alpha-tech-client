

// ✅ purchaseOrderReceiptApi.js — API ฝั่งใบรับสินค้า (ESM)
import apiClient from '@/utils/apiClient';

// ────────────────────────────────────────────────────────────────────────────────
// Receipts (เดิม)
// ────────────────────────────────────────────────────────────────────────────────
export const getAllReceipts = async (params = {}) => {
  try {
    const { data } = await apiClient.get('/purchase-order-receipts', { params });
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

export const getReceiptBarcodeSummaries = async (params = {}) => {
  try {
    const { data } = await apiClient.get('/purchase-order-receipts/receipt-barcode-summaries', { params });
    return data;
  } catch (error) {
    console.error('❌ getReceiptBarcodeSummaries error:', error);
    throw error;
  }
};

export const getReceiptsReadyToPay = async (params = {}) => {
  try {
    const { data } = await apiClient.get('/purchase-order-receipts/ready-to-pay', { params });
    return data;
  } catch (error) {
    console.error('❌ getReceiptsReadyToPay error:', error);
    throw error;
  }
};

export const markReceiptAsCompleted = async (receiptId) => {
  try {
    const { data } = await apiClient.patch(`/purchase-order-receipts/${receiptId}/complete`);
    return data;
  } catch (error) {
    console.error('❌ markReceiptAsCompleted error:', error);
    throw error;
  }
};

export const finalizeReceiptIfNeeded = async (receiptId) => {
  try {
    const { data } = await apiClient.patch(`/purchase-order-receipts/${receiptId}/finalize`);
    return data;
  } catch (error) {
    console.error('❌ finalizeReceiptIfNeeded error:', error);
    throw error;
  }
};

export const markReceiptAsPrinted = async (receiptId) => {
  try {
    const { data } = await apiClient.patch(`/purchase-order-receipts/${receiptId}/printed`);
    return data;
  } catch (error) {
    console.error('❌ markReceiptAsPrinted error:', error);
    throw error;
  }
};

export const getReceiptSummaries = async (params = {}) => {
  try {
    const { data } = await apiClient.get('/purchase-order-receipts/summaries', { params });
    return data;
  } catch (error) {
    console.error('❌ getReceiptSummaries error:', error);
    throw error;
  }
};

// ────────────────────────────────────────────────────────────────────────────────
// QUICK + Barcode + Commit (SIMPLE & STRUCTURED)
// ────────────────────────────────────────────────────────────────────────────────
export const createQuickReceipt = async (payload) => {
  try {
    const { data } = await apiClient.post('/quick-receipts', payload);
    return data;
  } catch (error) {
    console.error('❌ createQuickReceipt error:', error);
    throw error;
  }
};

export const generateReceiptBarcodes = async (receiptId) => {
  try {
    const { data } = await apiClient.post(`/purchase-order-receipts/${receiptId}/generate-barcodes`);
    return data;
  } catch (error) {
    console.error('❌ generateReceiptBarcodes error:', error);
    throw error;
  }
};

export const printReceipt = async (receiptId, options = {}) => {
  try {
    const { data } = await apiClient.post(`/purchase-order-receipts/${receiptId}/print`, options);
    return data;
  } catch (error) {
    console.error('❌ printReceipt error:', error);
    throw error;
  }
};

export const commitReceipt = async (receiptId) => {
  try {
    const { data } = await apiClient.post(`/purchase-order-receipts/${receiptId}/commit`);
    return data;
  } catch (error) {
    console.error('❌ commitReceipt error:', error);
    throw error;
  }
};

// ────────────────────────────────────────────────────────────────────────────────
// Purchase Orders for Receipt (NEW)
// NOTE: used by purchaseOrderReceiptStore
// ────────────────────────────────────────────────────────────────────────────────
export const getEligiblePurchaseOrders = async (params = {}) => {
  try {
    const { data } = await apiClient.get('/purchase-orders/eligible-for-receipt', { params });
    return data;
  } catch (error) {
    console.error('❌ getEligiblePurchaseOrders error:', error);
    throw error;
  }
};

export const getPurchaseOrderDetailById = async (poId) => {
  try {
    const { data } = await apiClient.get(`/purchase-orders/${poId}/detail-for-receipt`);
    return data;
  } catch (error) {
    console.error('❌ getPurchaseOrderDetailById error:', error);
    throw error;
  }
};

// Update received qty/price for a specific receipt item (server decides rules)
export const updateReceiptItemReceived = async (receiptId, itemId, payload) => {
  try {
    const { data } = await apiClient.patch(
      `/purchase-order-receipts/${receiptId}/items/${itemId}`,
      payload
    );
    return data;
  } catch (error) {
    console.error('❌ updateReceiptItemReceived error:', error);
    throw error;
  }
};

// Finalize receipt + (optionally) update PO status on server
export const finalizeReceipt = async (receiptId, payload = {}) => {
  try {
    const { data } = await apiClient.patch(`/purchase-order-receipts/${receiptId}/finalize`, payload);
    return data;
  } catch (error) {
    console.error('❌ finalizeReceipt error:', error);
    throw error;
  }
};




