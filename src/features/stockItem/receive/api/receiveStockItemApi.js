import apiClient from '@/utils/apiClient';

export const receiveStockItemApi = async (payload) => {
  const response = await apiClient.post('/stock-items/receive-sn', payload);
  return response.data;
};
