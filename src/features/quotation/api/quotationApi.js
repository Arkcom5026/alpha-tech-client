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

const hydrateIssuedSnapshot = (quotation) => {
  const snapshot = quotation?.issuedSnapshot;
  if (!quotation || quotation.status === 'DRAFT' || !snapshot) return quotation;

  const customer = snapshot.customer || {};
  const totals = snapshot.totals || {};
  const superseded = Boolean(quotation.revisedTo);
  return {
    ...quotation,
    lifecycleStatus: quotation.status,
    status: superseded ? 'SUPERSEDED' : quotation.status,
    isSuperseded: superseded,
    revisionNumber: snapshot.revisionNumber ?? quotation.revisionNumber ?? 0,
    revisionRootId: snapshot.revisionRootId ?? quotation.revisionRootId ?? null,
    revisedFromId: snapshot.revisedFromId ?? quotation.revisedFromId ?? null,
    issueDate: snapshot.issueDate ?? quotation.issueDate,
    validUntil: snapshot.validUntil ?? quotation.validUntil,
    subject: snapshot.subject ?? quotation.subject,
    introduction: snapshot.introduction ?? quotation.introduction,
    closingNote: snapshot.closingNote ?? quotation.closingNote,
    notes: snapshot.notes ?? quotation.notes,
    paymentTerms: snapshot.paymentTerms ?? quotation.paymentTerms,
    documentHeaderSnapshot: snapshot.documentHeader ?? quotation.documentHeaderSnapshot,
    customerName: customer.name ?? quotation.customerName,
    customerCompany: customer.company ?? quotation.customerCompany,
    customerDepartment: customer.department ?? quotation.customerDepartment,
    customerContactName: customer.contactName ?? quotation.customerContactName,
    customerPhone: customer.phone ?? quotation.customerPhone,
    customerTaxId: customer.taxId ?? quotation.customerTaxId,
    customerAddress: customer.address ?? quotation.customerAddress,
    subtotal: totals.subtotal ?? quotation.subtotal,
    lineDiscountTotal: totals.lineDiscountTotal ?? quotation.lineDiscountTotal,
    billDiscount: totals.billDiscount ?? quotation.billDiscount,
    vatEnabled: totals.vatEnabled ?? quotation.vatEnabled,
    vatRate: totals.vatRate ?? quotation.vatRate,
    vatAmount: totals.vatAmount ?? quotation.vatAmount,
    grandTotal: totals.grandTotal ?? quotation.grandTotal,
    items: Array.isArray(snapshot.items) ? snapshot.items : quotation.items,
  };
};

const sanitizeQuotation = (quotation) => {
  const hydrated = hydrateIssuedSnapshot(quotation);
  if (!hydrated || !Array.isArray(hydrated.items)) return hydrated;
  return {
    ...hydrated,
    items: hydrated.items.map((item) => ({
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

export const getQuotationRevisionHistory = async (quotationId) =>
  unwrap(await apiClient.get(`/sales/quotations/${quotationId}/revisions`));

export const createQuotationRevision = async (quotationId, note = null) =>
  sanitizeQuotation(unwrap(await apiClient.post(`/sales/quotations/${quotationId}/revisions`, { note })));

export const updateQuotation = async (quotationId, payload) =>
  sanitizeQuotation(unwrap(await apiClient.put(`/sales/quotations/${quotationId}`, payload)));

export const addQuotationLine = async (quotationId, payload) =>
  unwrap(await apiClient.post(`/sales/quotations/${quotationId}/items`, sanitizeLinePayload(payload)));

export const updateQuotationLine = async (quotationId, lineId, payload) =>
  unwrap(await apiClient.put(`/sales/quotations/${quotationId}/items/${lineId}`, sanitizeLinePayload(payload)));

export const removeQuotationLine = async (quotationId, lineId) =>
  unwrap(await apiClient.delete(`/sales/quotations/${quotationId}/items/${lineId}`));

export const issueQuotation = async (quotationId, note = null) =>
  sanitizeQuotation(unwrap(await apiClient.post(`/sales/quotations/${quotationId}/issue`, { note })));

export const acceptQuotation = async (quotationId, note = null) =>
  sanitizeQuotation(unwrap(await apiClient.post(`/sales/quotations/${quotationId}/accept`, { note })));

export const rejectQuotation = async (quotationId, note = null) =>
  sanitizeQuotation(unwrap(await apiClient.post(`/sales/quotations/${quotationId}/reject`, { note })));

export const cancelQuotation = async (quotationId, note = null) =>
  sanitizeQuotation(unwrap(await apiClient.post(`/sales/quotations/${quotationId}/cancel`, { note })));
