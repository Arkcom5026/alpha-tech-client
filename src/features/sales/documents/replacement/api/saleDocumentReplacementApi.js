import apiClient from '@/utils/apiClient';

const unwrapReplacement = (response) => response?.data?.replacement || response?.data || null;

export const getSaleDocumentReplacement = async (saleId) => {
  try {
    const response = await apiClient.get(`/sales/${saleId}/document-replacement`);
    return unwrapReplacement(response);
  } catch (error) {
    if (Number(error?.response?.status) === 404) return null;
    throw error;
  }
};

export const createSaleDocumentReplacement = async (saleId, reason) => {
  const response = await apiClient.post(`/sales/${saleId}/document-replacement`, { reason });
  return {
    replacement: response?.data?.replacement || null,
    replayed: Boolean(response?.data?.replayed),
  };
};

export const replaceSaleDocumentReplacementLines = async (saleId, { inBudgetLines, outOfBudgetLines }) => {
  const response = await apiClient.put(`/sales/${saleId}/document-replacement/lines`, {
    inBudgetLines,
    outOfBudgetLines,
  });
  return unwrapReplacement(response);
};

export const lockSaleDocumentReplacement = async (saleId) => {
  const response = await apiClient.post(`/sales/${saleId}/document-replacement/lock`);
  return {
    replacement: response?.data?.replacement || null,
    finalSnapshot: response?.data?.finalSnapshot || null,
    supersededReplacementId: response?.data?.supersededReplacementId || null,
    replayed: Boolean(response?.data?.replayed),
  };
};
