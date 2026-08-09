import apiClient from '@/utils/apiClient';

const unwrap = (response) => response?.data?.data ?? response?.data;
const BASE_PATH = '/customer-money-receive';

export const createCustomerMoneyReceive = async (payload) => {
  const response = await apiClient.post(BASE_PATH, payload);
  return unwrap(response);
};

export const listCustomerMoneyReceives = async (params = {}) => {
  const response = await apiClient.get(BASE_PATH, { params });
  return unwrap(response) || [];
};

export const getCustomerMoneyReceive = async (id) => {
  const response = await apiClient.get(`${BASE_PATH}/${id}`);
  return unwrap(response);
};
