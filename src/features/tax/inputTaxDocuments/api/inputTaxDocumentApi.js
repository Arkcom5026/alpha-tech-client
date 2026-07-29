import apiClient from '@/utils/apiClient';

const unwrapData = (response) => response?.data?.data ?? response?.data;

const requirePositiveId = (value, fieldName) => {
  const normalized = Number(value);
  if (!Number.isInteger(normalized) || normalized <= 0) {
    const error = new Error(`${fieldName} ไม่ถูกต้อง`);
    error.code = 'INPUT_TAX_DOCUMENT_CLIENT_VALIDATION_ERROR';
    throw error;
  }
  return normalized;
};

const normalizeLimit = (value, fallback = 50) => {
  const normalized = Number(value);
  if (!Number.isInteger(normalized) || normalized <= 0) return fallback;
  return Math.min(normalized, 200);
};

const normalizeOffset = (value) => {
  const normalized = Number(value);
  return Number.isInteger(normalized) && normalized >= 0 ? normalized : 0;
};

export const listInputTaxDocuments = async ({
  branchId,
  status,
  documentType,
  limit = 50,
  offset = 0,
} = {}) => {
  const response = await apiClient.get('/tax/documents', {
    params: {
      branchId: requirePositiveId(branchId, 'branchId'),
      ...(status ? { status: String(status).trim().toUpperCase() } : {}),
      ...(documentType ? { documentType: String(documentType).trim().toUpperCase() } : {}),
      limit: normalizeLimit(limit),
      offset: normalizeOffset(offset),
    },
  });
  return unwrapData(response);
};

export const getInputTaxDocumentDetail = async ({ branchId, taxDocumentId }) => {
  const response = await apiClient.get(`/tax/documents/${requirePositiveId(taxDocumentId, 'taxDocumentId')}`, {
    params: { branchId: requirePositiveId(branchId, 'branchId') },
  });
  return unwrapData(response);
};

export const getInputTaxDocumentErrorMessage = (error) => {
  const responseData = error?.response?.data;
  const code = error?.code
    || responseData?.error?.code
    || responseData?.code
    || responseData?.details?.code;
  const message = responseData?.message
    || responseData?.error?.message
    || responseData?.details?.message
    || error?.message;

  const messages = {
    INPUT_TAX_DOCUMENT_CLIENT_VALIDATION_ERROR: message || 'ข้อมูลเอกสารภาษีซื้อไม่ถูกต้อง',
    TAX_INTAKE_ACCESS_FORBIDDEN: 'บัญชีนี้ไม่มีสิทธิ์เข้าถึงเอกสารภาษี',
    TAX_INTAKE_BRANCH_FORBIDDEN: 'ไม่สามารถเข้าถึงเอกสารภาษีของสาขาอื่นได้',
    TAX_DOCUMENT_NOT_FOUND: 'ไม่พบเอกสารภาษีที่เลือก',
    TAX_BRANCH_REQUIRED: 'กรุณาเลือกสาขาก่อนเปิดเอกสารภาษีซื้อ',
    NETWORK_ERROR: 'ไม่สามารถเชื่อมต่อระบบเอกสารภาษีซื้อได้',
    ECONNABORTED: 'ระบบเอกสารภาษีซื้อตอบสนองช้าเกินไป กรุณาลองใหม่',
  };

  if (!error?.response && error?.request) {
    return 'ไม่สามารถเชื่อมต่อระบบเอกสารภาษีซื้อได้ กรุณาตรวจสอบว่า Backend ทำงานอยู่';
  }

  return messages[code] || message || 'ไม่สามารถโหลดข้อมูลเอกสารภาษีซื้อได้';
};
