import apiClient from '@/utils/apiClient';

const requestPrintableSales = async (path, params) => {
  const response = await apiClient.get(path, { params });
  return response.data;
};

export const fetchPrintableSalesTransport = async (params = {}) => {
  try {
    return await requestPrintableSales('/sales/printable', params);
  } catch (error) {
    if (error?.response?.status !== 404) throw error;
    return requestPrintableSales('/sales/printable-sales', params);
  }
};
