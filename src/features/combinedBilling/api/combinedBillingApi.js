import apiClient from '@/utils/apiClient';

export const getCombinableSales = async () => {
  const res = await apiClient.get('/combined-billing/combinable-sales');
  return res.data;
};

export const createCombinedBillingDocument = async (saleIds, note = '') => {
  const res = await apiClient.post('/combined-billing/create', { saleIds, note });
  return res.data;
};

export const getCombinedBillingPresentation = async (id) => {
  const res = await apiClient.get(`/combined-billing/${id}/presentation`);
  return res.data?.data ?? res.data;
};

export const getCombinedBillingById = async (id) => {
  const [detailResponse, presentationAuthority] = await Promise.all([
    apiClient.get(`/combined-billing/${id}`),
    getCombinedBillingPresentation(id),
  ]);
  const detail = detailResponse.data;
  return detail ? { ...detail, presentationAuthority: presentationAuthority || null } : detail;
};

export const getCustomersWithPendingSales = async () => {
  const res = await apiClient.get('/combined-billing/with-pending-sales');
  return res.data;
};

export const getDocumentWorkspace = async (customerId) => {
  const res = await apiClient.get('/combined-billing/document-workspace', { params: { customerId } });
  return res.data;
};

export const confirmDocumentWorkspace = async ({ customerId, note, lines }) => {
  const res = await apiClient.post('/combined-billing/document-workspace/confirm', { customerId, note, lines });
  return res.data;
};

export const listConsolidatedDeliveries = async () => (await apiClient.get('/combined-billing/consolidated-deliveries')).data;
export const getConsolidatedDelivery = async (id) => (await apiClient.get(`/combined-billing/consolidated-deliveries/${id}`)).data;
export const getConsolidatedDeliveryPrintable = async (id) => (await apiClient.get(`/combined-billing/consolidated-deliveries/${id}/printable`)).data;
export const updateConsolidatedDeliveryDocumentLine = async ({ documentId, lineId, documentPrefix, documentDescription, documentSuffix }) => (
  await apiClient.put(`/combined-billing/consolidated-deliveries/${documentId}/document-lines/${lineId}`, { documentPrefix, documentDescription, documentSuffix })
).data;
export const issueConsolidatedTaxDocument = async ({ branchId, taxDocumentId, taxInvoiceKind, recipient }) => {
  const res = await apiClient.post(`/tax/documents/${taxDocumentId}/issue`, { branchId, taxInvoiceKind, ...(recipient ? { recipient } : {}) });
  return res.data?.data ?? res.data;
};
export const getConsolidatedTaxPrintable = async ({ branchId, taxDocumentId }) => {
  const res = await apiClient.get(`/tax/documents/${taxDocumentId}/printable`, { params: { branchId } });
  return res.data?.data ?? res.data;
};
