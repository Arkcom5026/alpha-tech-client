import apiClient from '@/utils/apiClient';

export const receiveAllPendingStockItemsApi = async ({ receiptId } = {}) => {
  const normalizedReceiptId = Number(receiptId);

  if (!Number.isFinite(normalizedReceiptId) || normalizedReceiptId <= 0) {
    throw new Error('receiptId ไม่ถูกต้อง');
  }

  const response = await apiClient.post('/stock-items/receive-all-no-sn', {
    receiptId: normalizedReceiptId,
  });

  return response.data;
};
