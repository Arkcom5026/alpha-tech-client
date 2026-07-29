import { getSaleById, updateSaleDocumentLines } from '@/features/sales/api/saleApi';

export const loadSaleDocument = async ({ saleId, paymentId } = {}) => {
  if (!saleId) throw new Error('saleId is required');

  return getSaleById(saleId, {
    includePayments: true,
    includeBranch: true,
    ...(paymentId ? { paymentId } : {}),
    params: {
      includePayments: 1,
      includeBranch: 1,
      ...(paymentId ? { paymentId } : {}),
    },
  });
};

export const saveSaleDocumentLines = async ({ saleId, payload } = {}) => {
  if (!saleId) throw new Error('saleId is required');
  return updateSaleDocumentLines(saleId, payload || {});
};
