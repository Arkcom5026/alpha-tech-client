import apiClient from '@/utils/apiClient';

export const getReceiptBarcodeSummariesApi = async (params = {}) => {
  const { data } = await apiClient.get(
    '/purchase-order-receipts/receipt-barcode-summaries',
    { params }
  );

  return data;
};
