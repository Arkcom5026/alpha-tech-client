import apiClient from '@/utils/apiClient';

const unwrap = (response) => response?.data?.data ?? response?.data;
const BASE_PATH = '/customer-money-settlements/delivery-credit';

export const getEligibleDeliveryCredits = async (params) => {
  const response = await apiClient.get(`${BASE_PATH}/eligible-sales`, { params });
  return unwrap(response);
};

export const createDeliveryCreditSettlement = async (payload, idempotencyKey = null) => {
  const response = await apiClient.post(BASE_PATH, payload, {
    headers: idempotencyKey ? { 'X-Idempotency-Key': idempotencyKey } : undefined,
  });
  return unwrap(response);
};

export const listDeliveryCreditSettlements = async (params = {}) => {
  const response = await apiClient.get(BASE_PATH, { params });
  return unwrap(response) || [];
};

export const getDeliveryCreditSettlement = async (id) => {
  const response = await apiClient.get(`${BASE_PATH}/${id}`);
  return unwrap(response);
};

export const cancelDeliveryCreditSettlement = async (id, cancelReason) => {
  const response = await apiClient.post(`${BASE_PATH}/${id}/cancel`, { cancelReason });
  return unwrap(response);
};