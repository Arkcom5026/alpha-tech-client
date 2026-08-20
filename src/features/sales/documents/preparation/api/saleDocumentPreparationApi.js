import apiClient from '@/utils/apiClient';

const unwrapPreparation = (response) => response?.data?.preparation || response?.data || null;

export const getSaleDocumentPreparation = async (saleId) => {
  try {
    const response = await apiClient.get(`/sales/${saleId}/document-preparation`);
    return unwrapPreparation(response);
  } catch (error) {
    if (Number(error?.response?.status) === 404) return null;
    throw error;
  }
};

export const createSaleDocumentPreparation = async (saleId) => {
  const response = await apiClient.post(`/sales/${saleId}/document-preparation`);
  return response?.data?.preparation || null;
};

export const replaceSaleDocumentPreparationLines = async (saleId, lines) => {
  const response = await apiClient.put(`/sales/${saleId}/document-preparation/lines`, { lines });
  return unwrapPreparation(response);
};

export const lockSaleDocumentPreparation = async (saleId) => {
  const response = await apiClient.post(`/sales/${saleId}/document-preparation/lock`);
  return {
    preparation: response?.data?.preparation || null,
    finalSnapshot: response?.data?.finalSnapshot || null,
    replayed: Boolean(response?.data?.replayed),
  };
};

export const projectSaleDocumentPreparationTaxDrafts = async (saleId) => {
  const response = await apiClient.post(`/sales/${saleId}/document-preparation/tax-candidates`);
  return response?.data || null;
};
