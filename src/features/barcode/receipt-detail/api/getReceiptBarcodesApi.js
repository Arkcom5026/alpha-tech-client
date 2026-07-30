import apiClient from '@/utils/apiClient';

export const getReceiptBarcodesApi = async (receiptId, params = {}) => {
  const { data } = await apiClient.get(`/barcodes/by-receipt/${receiptId}`, {
    params: Object.keys(params).length ? params : undefined,
  });

  return data;
};
