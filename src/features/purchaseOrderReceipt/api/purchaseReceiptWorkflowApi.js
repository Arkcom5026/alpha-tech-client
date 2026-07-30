import apiClient from '@/utils/apiClient';

const unwrapData = (payload) => (
  payload?.success && Object.prototype.hasOwnProperty.call(payload, 'data')
    ? payload.data
    : payload
);

export const getPurchaseOrderForReceipt = async (purchaseOrderId) => {
  const { data } = await apiClient.get(`/purchase-orders/${Number(purchaseOrderId)}/detail-for-receipt`);
  return unwrapData(data);
};

export const createPurchaseReceiptDraft = async (payload) => {
  const { data } = await apiClient.post('/purchase-order-receipts', payload);
  return unwrapData(data);
};

export const getPurchaseReceiptDraft = async (receiptId) => {
  const { data } = await apiClient.get(`/purchase-order-receipts/${Number(receiptId)}`);
  return unwrapData(data);
};

export const savePurchaseReceiptDraftItem = async (payload) => {
  const { data } = await apiClient.post('/purchase-order-receipt-items', payload);
  return unwrapData(data);
};

export const finalizePurchaseReceiptDraft = async (receiptId) => {
  const { data } = await apiClient.patch(`/purchase-order-receipts/${Number(receiptId)}/finalize`);
  return unwrapData(data);
};
