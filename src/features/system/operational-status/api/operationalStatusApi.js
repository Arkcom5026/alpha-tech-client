import apiClient from '@/utils/apiClient';

export const getOperationalVerification = async () => {
  const response = await apiClient.get('/system/operational-verification');
  return response?.data?.data || response?.data || null;
};
