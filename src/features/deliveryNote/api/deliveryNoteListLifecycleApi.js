import apiClient from '@/utils/apiClient';

const unwrap = (response) => response?.data?.data ?? response?.data ?? null;

export const loadDeliveryNoteListLifecycleSummaries = async ({ saleIds } = {}) => {
  const ids = [...new Set((Array.isArray(saleIds) ? saleIds : [])
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0))];

  if (ids.length === 0) return [];

  const result = await apiClient.get('/sales/delivery-note/lifecycle-summaries', {
    params: { saleIds: ids.join(',') },
  }).then(unwrap);

  return Array.isArray(result) ? result : [];
};

export const loadDeliveryNoteRevisionHistory = async ({ saleId } = {}) => {
  const normalizedSaleId = Number(saleId);
  if (!Number.isInteger(normalizedSaleId) || normalizedSaleId <= 0) {
    throw new Error('saleId is required');
  }

  return apiClient.get(`/sales/${normalizedSaleId}/delivery-note/revisions`).then(unwrap);
};

export const loadDeliveryNoteRevisionDetail = async ({ saleId, revisionId } = {}) => {
  const normalizedSaleId = Number(saleId);
  const normalizedRevisionId = Number(revisionId);
  if (!Number.isInteger(normalizedSaleId) || normalizedSaleId <= 0) {
    throw new Error('saleId is required');
  }
  if (!Number.isInteger(normalizedRevisionId) || normalizedRevisionId <= 0) {
    throw new Error('revisionId is required');
  }

  return apiClient.get(`/sales/${normalizedSaleId}/delivery-note/revisions/${normalizedRevisionId}`).then(unwrap);
};
