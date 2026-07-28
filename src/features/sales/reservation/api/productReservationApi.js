import apiClient from '@/utils/apiClient';

const unwrap = (response) => response?.data?.data ?? response?.data;

export const listProductReservations = async (params = {}) => {
  const response = await apiClient.get('/sales/reservations', { params });
  const data = unwrap(response) || {};
  return {
    items: Array.isArray(data.items) ? data.items : [],
    total: Number(data.total || 0),
    limit: Number(data.limit || params.limit || 50),
    offset: Number(data.offset || params.offset || 0),
  };
};

export const getProductReservation = async (reservationId) => {
  const response = await apiClient.get(`/sales/reservations/${reservationId}`);
  return unwrap(response);
};

export const markProductReservationReady = async (reservationId) => {
  const response = await apiClient.post(`/sales/reservations/${reservationId}/ready-for-pickup`);
  return unwrap(response);
};

export const cancelProductReservation = async (reservationId, reason = '') => {
  const response = await apiClient.post(`/sales/reservations/${reservationId}/cancel`, { reason });
  return unwrap(response);
};

export const convertProductReservationToSale = async (reservationId, input = {}) => {
  const commandId = input.commandId || `reservation-convert-${reservationId}`;
  const response = await apiClient.post(
    `/sales/reservations/${reservationId}/convert-to-sale`,
    {
      mode: input.mode || 'CASH',
      vatRate: input.vatRate ?? 7,
      isTaxInvoice: Boolean(input.isTaxInvoice),
      saleType: input.saleType,
      deliveryNoteMode: input.deliveryNoteMode,
      payment: input.payment || { paymentItems: [] },
      commandId,
    },
    { headers: { 'x-command-id': commandId } }
  );
  return unwrap(response);
};
