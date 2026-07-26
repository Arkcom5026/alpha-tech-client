import apiClient from '@/utils/apiClient';

const unwrapData = (response) => response?.data?.data ?? response?.data;

export const getTaxPeriodSummary = async ({ branchId, referenceDate } = {}) => {
  const response = await apiClient.get('/tax/periods/summary', {
    params: {
      branchId,
      ...(referenceDate ? { referenceDate } : {}),
    },
  });
  return unwrapData(response);
};

export const listTaxPeriods = async ({ branchId, status, fromDate, toDate } = {}) => {
  const response = await apiClient.get('/tax/periods', {
    params: {
      branchId,
      ...(status ? { status } : {}),
      ...(fromDate ? { fromDate } : {}),
      ...(toDate ? { toDate } : {}),
    },
  });
  return unwrapData(response);
};

export const getTaxPeriodDetail = async ({ branchId, taxPeriodId }) => {
  const response = await apiClient.get(`/tax/periods/${taxPeriodId}`, {
    params: { branchId },
  });
  return unwrapData(response);
};

export const ensureMonthlyTaxPeriod = async ({ branchId, referenceDate } = {}) => {
  const response = await apiClient.post('/tax/periods/ensure', {
    branchId,
    ...(referenceDate ? { referenceDate } : {}),
  });
  return unwrapData(response);
};

export const transitionTaxPeriod = async ({ branchId, taxPeriodId, action, occurredAt }) => {
  const normalizedAction = String(action || '').trim().toLowerCase();
  const response = await apiClient.post(`/tax/periods/${taxPeriodId}/${normalizedAction}`, {
    branchId,
    ...(occurredAt ? { occurredAt } : {}),
  });
  return unwrapData(response);
};

export const getTaxPeriodErrorMessage = (error) => {
  const code = error?.response?.data?.code || error?.response?.data?.error?.code;
  const message = error?.response?.data?.message || error?.response?.data?.error?.message;

  const messages = {
    TAX_PERIOD_ADMINISTRATIVE_ACCESS_FORBIDDEN: 'บัญชีนี้ไม่มีสิทธิ์จัดการรอบภาษี',
    TAX_PERIOD_ADMINISTRATIVE_BRANCH_FORBIDDEN: 'ไม่สามารถจัดการรอบภาษีของสาขาอื่นได้',
    TAX_PERIOD_NOT_FOUND: 'ไม่พบรอบภาษีที่เลือก',
    TAX_PERIOD_TRANSITION_FORBIDDEN: 'สถานะปัจจุบันไม่อนุญาตให้ทำรายการนี้',
    TAX_PERIOD_LIFECYCLE_CONFLICT: 'ข้อมูลรอบภาษีมีการเปลี่ยนแปลง กรุณาโหลดใหม่',
  };

  return messages[code] || message || 'ไม่สามารถดำเนินการเกี่ยวกับรอบภาษีได้';
};
