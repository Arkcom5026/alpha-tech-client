import { receiveAllPendingStockItemsApi } from '../api/receiveAllPendingStockItemsApi';

export const receiveAllPendingStockItems = async ({ receiptId } = {}) => {
  const normalizedReceiptId = Number(receiptId);

  if (!Number.isFinite(normalizedReceiptId) || normalizedReceiptId <= 0) {
    throw new Error('receiptId ไม่ถูกต้อง');
  }

  const sourceResponse = await receiveAllPendingStockItemsApi({
    receiptId: normalizedReceiptId,
  });

  return {
    receiptId: normalizedReceiptId,
    sourceResponse,
  };
};
