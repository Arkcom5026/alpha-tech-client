import apiClient from '@/utils/apiClient';

const unwrap = (response) => response?.data?.data ?? response?.data;

export const createCustomerMoneyReceive = async (payload) => {
  const response = await apiClient.post('/finance/customer-money-receive', payload);
  return unwrap(response);
};

export const listCustomerMoneyReceives = async (params = {}) => {
  const response = await apiClient.get('/finance/customer-money-receive', { params });
  return unwrap(response) || [];
};

export const getCustomerMoneyReceive = async (id) => {
  const response = await apiClient.get(`/finance/customer-money-receive/${id}`);
  return unwrap(response);
};
