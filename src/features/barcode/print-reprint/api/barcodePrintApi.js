import apiClient from '@/utils/apiClient';

export const fetchReceiptBarcodesForPrintApi = async (receiptId, params = {}) => {
  const { data } = await apiClient.get(`/barcodes/by-receipt/${receiptId}`, { params });
  return data;
};

export const reprintReceiptBarcodesApi = async (receiptId) => {
  const { data } = await apiClient.patch(`/barcodes/reprint/${receiptId}`);
  return data;
};

export const markReceiptBarcodesPrintedApi = async (purchaseOrderReceiptId) => {
  const { data } = await apiClient.patch('/barcodes/mark-printed', { purchaseOrderReceiptId });
  return data;
};

export const searchReceiptsForReprintApi = async (params = {}) => {
  const { data } = await apiClient.get('/barcodes/reprint-search', { params });
  return data;
};
