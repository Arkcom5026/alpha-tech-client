import { getReceiptById } from '../api/purchaseOrderReceiptApi';

export const getReceipt = async (receiptId) => getReceiptById(receiptId);
