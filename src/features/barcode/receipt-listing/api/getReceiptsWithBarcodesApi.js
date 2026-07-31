import apiClient from '@/utils/apiClient';

export const getReceiptsWithBarcodesApi = async (params = {}) => {
  try {
    const { data } = await apiClient.get('/barcodes/receipts-with-barcodes', {
      params: Object.keys(params).length ? params : undefined,
    });
    return data;
  } catch (error) {
    if (error?.response?.status !== 404) throw error;

    const { data } = await apiClient.get('/barcodes/with-barcodes', {
      params: Object.keys(params).length ? params : undefined,
    });
    return data;
  }
};
