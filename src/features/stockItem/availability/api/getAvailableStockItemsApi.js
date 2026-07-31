import apiClient from '@/utils/apiClient';

export const getAvailableStockItemsApi = async (productId) => {
  const response = await apiClient.get('/stock-items/available', {
    params: { productId },
  });

  return response.data;
};
