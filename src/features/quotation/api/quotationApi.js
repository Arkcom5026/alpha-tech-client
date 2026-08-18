import apiClient from '@/utils/apiClient';

const unwrap = (response) => response?.data?.data ?? response?.data ?? null;

const PLACEHOLDER_MODEL_DESCRIPTION = /^\s*รุ่น\/แบบ:\s*(?:D|-|N\/?A|ไม่มี|ไม่ระบุ)\s*$/i;

const sanitizeLineDescription = (description) => {
  const value = String(description || '');
  return PLACEHOLDER_MODEL_DESCRIPTION.test(value) ? '' : value;
};

const sanitizeLinePayload = (payload = {}) => ({
  ...payload,
  description: sanitizeLineDescription(payload.description),
});

const sanitizeQuotation = (quotation) => {
  if (!quotation || !Array.isArray(quotation.items)) return quotation;
  return {
    ...quotation,
    items: quotation.items.map((item) => ({
      ...item,
      description: sanitizeLineDescription(item?.description),
    })),
  };
};

export const listQuotations = async ({ status = '', query = '', limit = 50 } = {}) => {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (query) params.set('q', query);
  params.set('limit', String(limit));
  return unwrap(await apiClient.get(`/sales/quotations?${params.toString()}`));
};

export const createQuotation = async ({ customerId = null } = {}) =>
  unwrap(await apiClient.post('/sales/quotations', { customerId }));

export const getQuotation = async (quotationId) =>
  sanitizeQuotation(unwrap(await apiClient.get(`/sales/quotations/${quotationId}`)));

export const updateQuotation = async (quotationId, payload) =>
  sanitizeQuotation(unwrap(await apiClient.put(`/sales/quotations/${quotationId}`, payload)));

export const addQuotationLine = async (quotationId, payload) =>
  unwrap(await apiClient.post(`/sales/quotations/${quotationId}/items`, sanitizeLinePayload(payload)));

export const updateQuotationLine = async (quotationId, lineId, payload) =>
  unwrap(await apiClient.put(`/sales/quotations/${quotationId}/items/${lineId}`, sanitizeLinePayload(payload)));

export const removeQuotationLine = async (quotationId, lineId) =>
  unwrap(await apiClient.delete(`/sales/quotations/${quotationId}/items/${lineId}`));

export const issueQuotation = async (quotationId, note = null) =>
  unwrap(await apiClient.post(`/sales/quotations/${quotationId}/issue`, { note }));

export const acceptQuotation = async (quotationId, note = null) =>
  unwrap(await apiClient.post(`/sales/quotations/${quotationId}/accept`, { note }));

export const rejectQuotation = async (quotationId, note = null) =>
  unwrap(await apiClient.post(`/sales/quotations/${quotationId}/reject`, { note }));

export const cancelQuotation = async (quotationId, note = null) =>
  unwrap(await apiClient.post(`/sales/quotations/${quotationId}/cancel`, { note }));
