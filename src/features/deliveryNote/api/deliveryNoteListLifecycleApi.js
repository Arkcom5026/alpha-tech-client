import apiClient from '@/utils/apiClient';

const unwrap = (response) => response?.data?.data ?? response?.data ?? null;

const requirePositiveInt = (value, field) => {
  const normalized = Number(value);
  if (!Number.isInteger(normalized) || normalized <= 0) {
    throw new Error(`${field} is required`);
  }
  return normalized;
};

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
  const normalizedSaleId = requirePositiveInt(saleId, 'saleId');
  return apiClient.get(`/sales/${normalizedSaleId}/delivery-note/revisions`).then(unwrap);
};

export const loadDeliveryNoteRevisionDetail = async ({ saleId, revisionId } = {}) => {
  const normalizedSaleId = requirePositiveInt(saleId, 'saleId');
  const normalizedRevisionId = requirePositiveInt(revisionId, 'revisionId');
  return apiClient.get(`/sales/${normalizedSaleId}/delivery-note/revisions/${normalizedRevisionId}`).then(unwrap);
};

export const loadDeliveryNoteRevisionPrint = async ({ saleId, revisionId } = {}) => {
  const normalizedSaleId = requirePositiveInt(saleId, 'saleId');
  const normalizedRevisionId = requirePositiveInt(revisionId, 'revisionId');
  return apiClient.get(`/sales/${normalizedSaleId}/delivery-note/revisions/${normalizedRevisionId}/print`).then(unwrap);
};
