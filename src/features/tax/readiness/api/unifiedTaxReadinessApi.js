import apiClient from '@/utils/apiClient';

const unwrapData = (response) => response?.data?.data ?? response?.data;

export const getUnifiedTaxReadiness = async ({ branchId, taxPeriodId }) => {
  const normalizedBranchId = Number(branchId);
  const normalizedPeriodId = String(taxPeriodId || '').trim();
  if (!Number.isInteger(normalizedBranchId) || normalizedBranchId <= 0 || !normalizedPeriodId) {
    const error = new Error('ข้อมูลรอบภาษีไม่ถูกต้อง');
    error.code = 'TAX_READINESS_CLIENT_VALIDATION_ERROR';
    throw error;
  }
  const response = await apiClient.get(`/tax/tax-readiness/${encodeURIComponent(normalizedPeriodId)}`, {
    params: { branchId: normalizedBranchId },
  });
  return unwrapData(response);
};

export const getUnifiedTaxReadinessErrorMessage = (error) => {
  const responseData = error?.response?.data;
  const code = error?.code || responseData?.code || responseData?.error?.code;
  const message = responseData?.message || responseData?.error?.message || error?.message;
  const messages = {
    TAX_READINESS_CLIENT_VALIDATION_ERROR: 'กรุณาเลือกร้านและรอบภาษีให้ถูกต้อง',
    TAX_READINESS_ACCESS_FORBIDDEN: 'บัญชีนี้ไม่มีสิทธิ์ดู Tax Readiness',
    TAX_READINESS_BRANCH_FORBIDDEN: 'ไม่สามารถดู Tax Readiness ของสาขาอื่นได้',
    TAX_READINESS_BRANCH_REQUIRED: 'ไม่พบสาขาสำหรับ Tax Readiness',
  };
  return messages[code] || message || 'ไม่สามารถโหลด Tax Readiness ได้';
};
