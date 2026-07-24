import apiClient from '@/utils/apiClient';

export const getReturnableSales = async () => {
  const response = await apiClient.get('/sales/return');
  return response.data;
};

export const getSaleReturnEligibility = async (saleId) => {
  const response = await apiClient.get(`/sales/returns/eligible/${saleId}`);
  return response.data;
};

export const completeSaleReturn = async (command) => {
  const response = await apiClient.post('/sales/returns/complete', command);
  return response.data;
};
