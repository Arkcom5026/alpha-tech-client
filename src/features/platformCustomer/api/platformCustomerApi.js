import apiClient from '@/utils/apiClient';

export const getPlatformCustomerOverview = async ({ query = '', limit = 100 } = {}) => {
  const response = await apiClient.get('/customers/platform/overview', {
    params: { q: String(query || '').trim(), limit },
  });
  return response.data;
};
