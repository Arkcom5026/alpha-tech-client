import apiClient from '@/utils/apiClient';

const unwrapData = (response) => response?.data?.data ?? response?.data;

const requirePositiveId = (value, fieldName) => {
  const normalized = Number(value);
  if (!Number.isInteger(normalized) || normalized <= 0) {
    const error = new Error(`${fieldName} ไม่ถูกต้อง`);
    error.code = 'VAT_SETTLEMENT_CLIENT_VALIDATION_ERROR';
    throw error;
  }
  return normalized;
};

const requireText = (value, fieldName) => {
  const normalized = String(value || '').trim();
  if (!normalized) {
    const error = new Error(`${fieldName} ไม่ถูกต้อง`);
    error.code = 'VAT_SETTLEMENT_CLIENT_VALIDATION_ERROR';
    throw error;
  }
  return normalized;
};

export const getVatSettlementPreparation = async ({ branchId, taxPeriodId }) => {
  const normalizedBranchId = requirePositiveId(branchId, 'branchId');
  const normalizedTaxPeriodId = requireText(taxPeriodId, 'taxPeriodId');
  const response = await apiClient.get(`/tax/vat-settlement/${encodeURIComponent(normalizedTaxPeriodId)}`, {
    params: { branchId: normalizedBranchId },
  });
  return unwrapData(response);
};

export const getVatSettlementErrorMessage = (error) => {
  const responseData = error?.response?.data;
  const code = error?.code || responseData?.code || responseData?.error?.code;
  const message = responseData?.message || responseData?.error?.message || error?.message;
  const messages = {
    VAT_SETTLEMENT_CLIENT_VALIDATION_ERROR: message || 'ข้อมูล VAT Settlement ไม่ถูกต้อง',
    VAT_SETTLEMENT_ACCESS_FORBIDDEN: 'บัญชีนี้ไม่มีสิทธิ์ดู VAT Settlement',
    VAT_SETTLEMENT_BRANCH_FORBIDDEN: 'ไม่สามารถดู VAT Settlement ของสาขาอื่นได้',
    VAT_SETTLEMENT_PERIOD_REQUIRED: 'กรุณาเลือกรอบภาษี',
    ACCOUNTING_OFFICE_PERIOD_NOT_FOUND: 'ไม่พบรอบภาษีที่เลือก',
  };
  return messages[code] || message || 'ไม่สามารถโหลด VAT Settlement ได้';
};
