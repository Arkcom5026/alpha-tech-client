import apiClient from '@/utils/apiClient';

export const getReturnableSales = async () => {
  const response = await apiClient.get('/sales/return');
  return response.data;
};

export const getSaleReturnEligibility = async (saleId) => {
  const response = await apiClient.get(`/sales/returns/eligible/${saleId}`);
  return response.data;
};

export const completeSaleReturn = async (command) => {
  const response = await apiClient.post('/sales/returns/complete', command);
  return response.data;
};


export const issueCreditNoteForSaleReturn = async ({ branchId, saleReturnId }) => {
  const response = await apiClient.post(
    `/tax/credit-notes/from-sale-return/${Number(saleReturnId)}`,
    { branchId: Number(branchId) },
  );
  return response.data?.data || response.data;
};

export const getPrintableCreditNote = async ({ branchId, taxDocumentId }) => {
  const response = await apiClient.get(
    `/tax/documents/${Number(taxDocumentId)}/printable`,
    { params: { branchId: Number(branchId) } },
  );
  return response.data?.data || response.data;
};
