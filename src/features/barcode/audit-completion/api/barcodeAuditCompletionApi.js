import apiClient from '@/utils/apiClient';

export const auditReceiptBarcodesApi = async (receiptId, { includeDetails = true } = {}) => {
  const { data } = await apiClient.get(`/barcodes/receipt/${receiptId}/audit`, {
    params: { includeDetails: includeDetails ? 1 : 0 },
  });
  return data;
};

export const finalizeReceiptIfNeededApi = async (receiptId) => {
  const { data } = await apiClient.patch(`/purchase-order-receipts/${receiptId}/finalize`);
  return data;
};
