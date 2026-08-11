import apiClient from '@/utils/apiClient';

const unwrapData = (response) => response?.data?.data ?? response?.data;

const requirePositiveId = (value, fieldName) => {
  const normalized = Number(value);
  if (!Number.isInteger(normalized) || normalized <= 0) {
    const error = new Error(`${fieldName} ไม่ถูกต้อง`);
    error.code = 'TAX_INTAKE_CLIENT_VALIDATION_ERROR';
    throw error;
  }
  return normalized;
};

const optionalText = (value) => String(value || '').trim() || undefined;

export const registerTaxCandidate = async (payload = {}) => {
  const branchId = requirePositiveId(payload.branchId, 'branchId');
  const response = await apiClient.post('/tax/candidates/register', {
    ...payload,
    branchId,
  });
  return unwrapData(response);
};

export const listTaxCandidates = async ({ branchId, taxPeriodId, status, sourceType, limit = 50, offset = 0 } = {}) => {
  const response = await apiClient.get('/tax/candidates', {
    params: {
      branchId: requirePositiveId(branchId, 'branchId'),
      ...(optionalText(taxPeriodId) ? { taxPeriodId: optionalText(taxPeriodId) } : {}),
      ...(status ? { status: String(status).trim().toUpperCase() } : {}),
      ...(sourceType ? { sourceType: String(sourceType).trim().toUpperCase() } : {}),
      limit,
      offset,
    },
  });
  return unwrapData(response);
};

export const listTaxDocuments = async ({ branchId, taxPeriodId, status, documentType, limit = 50, offset = 0 } = {}) => {
  const response = await apiClient.get('/tax/documents', {
    params: {
      branchId: requirePositiveId(branchId, 'branchId'),
      ...(optionalText(taxPeriodId) ? { taxPeriodId: optionalText(taxPeriodId) } : {}),
      ...(status ? { status: String(status).trim().toUpperCase() } : {}),
      ...(documentType ? { documentType: String(documentType).trim().toUpperCase() } : {}),
      limit,
      offset,
    },
  });
  return unwrapData(response);
};

export const getTaxDocumentDetail = async ({ branchId, taxDocumentId }) => {
  const response = await apiClient.get(`/tax/documents/${requirePositiveId(taxDocumentId, 'taxDocumentId')}`, {
    params: { branchId: requirePositiveId(branchId, 'branchId') },
  });
  return unwrapData(response);
};

export const transitionTaxDocument = async ({ branchId, taxDocumentId, targetStatus, reason }) => {
  const response = await apiClient.post(
    `/tax/documents/${requirePositiveId(taxDocumentId, 'taxDocumentId')}/transition`,
    {
      branchId: requirePositiveId(branchId, 'branchId'),
      targetStatus: String(targetStatus || '').trim().toUpperCase(),
      ...(String(reason || '').trim() ? { reason: String(reason).trim() } : {}),
    },
  );
  return unwrapData(response);
};

export const issueOutputTaxDocument = async ({ branchId, taxDocumentId, taxInvoiceKind, recipient }) => {
  const response = await apiClient.post(
    `/tax/documents/${requirePositiveId(taxDocumentId, 'taxDocumentId')}/issue`,
    {
      branchId: requirePositiveId(branchId, 'branchId'),
      taxInvoiceKind: String(taxInvoiceKind || '').trim().toUpperCase(),
      ...(recipient ? { recipient } : {}),
    },
  );
  return unwrapData(response);
};

export const getOutputTaxPrintable = async ({ branchId, taxDocumentId }) => {
  const response = await apiClient.get(
    `/tax/documents/${requirePositiveId(taxDocumentId, 'taxDocumentId')}/printable`,
    { params: { branchId: requirePositiveId(branchId, 'branchId') } },
  );
  return unwrapData(response);
};

export const getTaxIssuerProfile = async ({ branchId }) => {
  const response = await apiClient.get('/tax/issuer-profile', {
    params: { branchId: requirePositiveId(branchId, 'branchId') },
  });
  return unwrapData(response);
};

export const saveTaxIssuerProfile = async ({ branchId, ...profile }) => {
  const response = await apiClient.put('/tax/issuer-profile', {
    ...profile,
    branchId: requirePositiveId(branchId, 'branchId'),
  });
  return unwrapData(response);
};

export const getTaxIntakeErrorDetails = (error) => (
  error?.response?.data?.error?.details || error?.response?.data?.details || null
);

export const getTaxIntakeErrorMessage = (error) => {
  const responseData = error?.response?.data;
  const code = error?.code || responseData?.error?.code || responseData?.code
    || (typeof responseData?.error === 'string' ? responseData.error : null);
  const message = responseData?.message || responseData?.error?.message || error?.message;
  const messages = {
    TAX_INTAKE_CLIENT_VALIDATION_ERROR: message || 'ข้อมูลไม่ถูกต้อง',
    TAX_ADMINISTRATIVE_ACCESS_FORBIDDEN: 'บัญชีนี้ไม่มีสิทธิ์เข้าถึงระบบภาษี',
    TAX_ADMINISTRATIVE_BRANCH_FORBIDDEN: 'ไม่สามารถเข้าถึงข้อมูลภาษีของสาขาอื่นได้',
    TAX_DOCUMENT_NOT_FOUND: 'ไม่พบเอกสารภาษีที่เลือก',
    TAX_DOCUMENT_IDENTITY_CONFLICT: 'มีเอกสารภาษีเลขที่นี้อยู่แล้ว',
    TAX_PERIOD_NOT_FOUND: 'ไม่พบรอบภาษีที่เลือก กรุณาโหลดรอบภาษีใหม่',
    INPUT_TAX_RECONCILIATION_REQUIRED: 'ยังอนุมัติไม่ได้: ยอดใบรับสินค้าที่ผูกไว้ยังไม่ตรงกับยอดเอกสารภาษี',
  };
  return messages[code] || message || 'ไม่สามารถดำเนินการในระบบรับเอกสารภาษีได้';
};
