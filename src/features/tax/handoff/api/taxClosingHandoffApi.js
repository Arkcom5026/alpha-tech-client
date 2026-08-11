import apiClient from '@/utils/apiClient';

const unwrapData = (response) => response?.data?.data ?? response?.data;

const requirePositiveId = (value, fieldName) => {
  const normalized = Number(value);
  if (!Number.isInteger(normalized) || normalized <= 0) {
    const error = new Error(`${fieldName} ไม่ถูกต้อง`);
    error.code = 'TAX_CLOSING_HANDOFF_CLIENT_VALIDATION_ERROR';
    throw error;
  }
  return normalized;
};

const requireText = (value, fieldName) => {
  const normalized = String(value || '').trim();
  if (!normalized) {
    const error = new Error(`${fieldName} ไม่ถูกต้อง`);
    error.code = 'TAX_CLOSING_HANDOFF_CLIENT_VALIDATION_ERROR';
    throw error;
  }
  return normalized;
};

export const getTaxClosingHandoffBundle = async ({ branchId, taxPeriodId }) => {
  const normalizedBranchId = requirePositiveId(branchId, 'branchId');
  const normalizedTaxPeriodId = requireText(taxPeriodId, 'taxPeriodId');
  const response = await apiClient.get(`/tax/tax-closing-handoff/${encodeURIComponent(normalizedTaxPeriodId)}`, {
    params: { branchId: normalizedBranchId },
  });
  return unwrapData(response);
};

export const getTaxClosingHandoffErrorMessage = (error) => {
  const responseData = error?.response?.data;
  const code = error?.code || responseData?.code || responseData?.error?.code;
  const message = responseData?.message || responseData?.error?.message || error?.message;
  const messages = {
    TAX_CLOSING_HANDOFF_CLIENT_VALIDATION_ERROR: message || 'ข้อมูล Tax Closing Package ไม่ถูกต้อง',
    TAX_CLOSING_HANDOFF_ACCESS_FORBIDDEN: 'บัญชีนี้ไม่มีสิทธิ์จัดชุดข้อมูลภาษี',
    TAX_CLOSING_HANDOFF_BRANCH_FORBIDDEN: 'ไม่สามารถจัดชุดข้อมูลของสาขาอื่นได้',
    ACCOUNTING_OFFICE_PERIOD_NOT_FOUND: 'ไม่พบรอบภาษีที่เลือก',
  };
  return messages[code] || message || 'ไม่สามารถโหลด Tax Closing Package ได้';
};
