import apiClient from '@/utils/apiClient';

export const searchStockItemApi = async (query) => {
  const normalizedQuery = String(query || '').trim();

  if (!normalizedQuery) {
    throw new Error('กรุณาระบุคำค้นหา');
  }

  const response = await apiClient.get('/stock-items/search', {
    params: { query: normalizedQuery },
  });

  return response.data;
};
