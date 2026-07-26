import apiClient from '@/utils/apiClient';

export const getAllBanks = async (params = {}) => {
  const { q, includeInactive } = params;
  const res = await apiClient.get('/banks', {
    params: {
      q: q || undefined,
      includeInactive: includeInactive ? 1 : undefined,
    },
  });
  return res.data;
};

export const getBankById = async (id) => {
  if (!id) return null;
  const res = await apiClient.get(`/banks/${id}`);
  return res.data;
};

export const createBank = async (payload) => {
  const res = await apiClient.post('/banks', payload);
  return res.data;
};

export const updateBank = async (id, payload) => {
  const res = await apiClient.patch(`/banks/${id}`, payload);
  return res.data;
};

export const deleteBank = async (id) => {
  const res = await apiClient.delete(`/banks/${id}`);
  return res.data;
};
