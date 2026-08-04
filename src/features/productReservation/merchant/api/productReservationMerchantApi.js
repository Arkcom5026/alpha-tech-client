import apiClient from '@/utils/apiClient';

const unwrap = (response) => response?.data?.data ?? response?.data ?? null;

export const listMerchantProductReservations = async ({ statuses = [], limit = 100 } = {}) => {
  const params = new URLSearchParams();
  if (Array.isArray(statuses) && statuses.length) params.set('status', statuses.join(','));
  params.set('limit', String(limit));

  const query = params.toString();
  return unwrap(await apiClient.get(`/sales/reservations${query ? `?${query}` : ''}`));
};

export const getMerchantProductReservation = async (reservationId) =>
  unwrap(await apiClient.get(`/sales/reservations/${reservationId}`));
