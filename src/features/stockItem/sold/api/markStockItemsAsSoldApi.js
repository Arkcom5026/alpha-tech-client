import apiClient from '@/utils/apiClient';

export const markStockItemsAsSoldApi = async (stockItemIds) => {
  const response = await apiClient.patch('/stock-items/mark-sold', {
    stockItemIds,
  });

  return response.data;
};
