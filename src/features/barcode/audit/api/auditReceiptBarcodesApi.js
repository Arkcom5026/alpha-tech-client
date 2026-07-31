import apiClient from '@/utils/apiClient';

export const auditReceiptBarcodesApi = async ({ receiptId, includeDetails }) => {
  const response = await apiClient.get(`/barcodes/receipt/${receiptId}/audit`, {
    params: { includeDetails: includeDetails ? 1 : 0 },
  });

  return response?.data;
};
