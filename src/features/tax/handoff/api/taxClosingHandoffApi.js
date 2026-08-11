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

const normalizeArgs = ({ branchId, taxPeriodId }) => ({
  branchId: requirePositiveId(branchId, 'branchId'),
  taxPeriodId: requireText(taxPeriodId, 'taxPeriodId'),
});

export const getTaxClosingHandoffBundle = async (args) => {
  const normalized = normalizeArgs(args);
  const response = await apiClient.get(`/tax/tax-closing-handoff/${encodeURIComponent(normalized.taxPeriodId)}`, {
    params: { branchId: normalized.branchId },
  });
  return unwrapData(response);
};

export const finalizeTaxClosingHandoffBundle = async (args) => {
  const normalized = normalizeArgs(args);
  const response = await apiClient.post(
    `/tax/tax-closing-handoff/${encodeURIComponent(normalized.taxPeriodId)}/finalize`,
    {},
    { params: { branchId: normalized.branchId } },
  );
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
    TAX_CLOSING_FINALIZATION_NOT_READY: 'ยังไม่สามารถยืนยันชุดปิดภาษีได้ กรุณาแก้รายการที่ยังไม่พร้อมก่อน',
    TAX_CLOSING_FINALIZATION_CONFLICT: 'ข้อมูลภาษีมีการเปลี่ยนแปลงระหว่างยืนยัน กรุณารีเฟรชและตรวจสอบอีกครั้ง',
    ACCOUNTING_OFFICE_PERIOD_NOT_FOUND: 'ไม่พบรอบภาษีที่เลือก',
  };
  return messages[code] || message || 'ไม่สามารถโหลด Tax Closing Package ได้';
};
