import apiClient from '@/utils/apiClient';
import { getSaleById, updateSaleDocumentLines } from '@/features/sales/api/saleApi';

const unwrap = (response) => response?.data?.data ?? response?.data ?? null;

export const loadSaleDocument = async ({ saleId, paymentId } = {}) => {
  if (!saleId) throw new Error('saleId is required');

  const [sale, sourceQuotation] = await Promise.all([
    getSaleById(saleId, {
      includePayments: true,
      includeBranch: true,
      ...(paymentId ? { paymentId } : {}),
      params: {
        includePayments: 1,
        includeBranch: 1,
        ...(paymentId ? { paymentId } : {}),
      },
    }),
    apiClient.get(`/sales/${saleId}/quotation-reference`).then(unwrap).catch(() => null),
  ]);

  return sale ? { ...sale, sourceQuotation: sourceQuotation || null } : sale;
};

export const loadSaleDeliveryNoteAuthority = async ({ saleId } = {}) => {
  if (!saleId) throw new Error('saleId is required');
  return apiClient.get(`/sales/${saleId}/delivery-note`).then(unwrap);
};

export const issueSaleDeliveryNote = async ({ saleId } = {}) => {
  if (!saleId) throw new Error('saleId is required');
  return apiClient.post(`/sales/${saleId}/delivery-note`).then(unwrap);
};

export const saveSaleDocumentLines = async ({ saleId, payload } = {}) => {
  if (!saleId) throw new Error('saleId is required');
  return updateSaleDocumentLines(saleId, payload || {});
};
