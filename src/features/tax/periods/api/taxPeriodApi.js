import apiClient from '@/utils/apiClient';

const ALLOWED_TRANSITION_ACTIONS = new Set(['CLOSE', 'LOCK', 'SUBMIT', 'REOPEN']);

const unwrapData = (response) => response?.data?.data ?? response?.data;

const requirePositiveId = (value, fieldName) => {
  const normalized = Number(value);
  if (!Number.isInteger(normalized) || normalized <= 0) {
    const error = new Error(`${fieldName} ไม่ถูกต้อง`);
    error.code = 'TAX_PERIOD_CLIENT_VALIDATION_ERROR';
    throw error;
  }
  return normalized;
};

const requireTextId = (value, fieldName) => {
  const normalized = String(value || '').trim();
  if (!normalized) {
    const error = new Error(`${fieldName} ไม่ถูกต้อง`);
    error.code = 'TAX_PERIOD_CLIENT_VALIDATION_ERROR';
    throw error;
  }
  return normalized;
};

const normalizeOptionalDate = (value, fieldName) => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    const error = new Error(`${fieldName} ไม่ถูกต้อง`);
    error.code = 'TAX_PERIOD_CLIENT_VALIDATION_ERROR';
    throw error;
  }
  return value;
};

const requireAction = (action) => {
  const normalized = String(action || '').trim().toUpperCase();
  if (!ALLOWED_TRANSITION_ACTIONS.has(normalized)) {
    const error = new Error('Action รอบภาษีไม่ถูกต้อง');
    error.code = 'TAX_PERIOD_CLIENT_VALIDATION_ERROR';
    throw error;
  }
  return normalized;
};

export const getTaxPeriodSummary = async ({ branchId, referenceDate } = {}) => {
  const normalizedBranchId = requirePositiveId(branchId, 'branchId');
  const normalizedReferenceDate = normalizeOptionalDate(referenceDate, 'referenceDate');

  const response = await apiClient.get('/tax/periods/summary', {
    params: {
      branchId: normalizedBranchId,
      ...(normalizedReferenceDate ? { referenceDate: normalizedReferenceDate } : {}),
    },
  });
  return unwrapData(response);
};

export const listTaxPeriods = async ({ branchId, status, fromDate, toDate } = {}) => {
  const normalizedBranchId = requirePositiveId(branchId, 'branchId');
  const normalizedFromDate = normalizeOptionalDate(fromDate, 'fromDate');
  const normalizedToDate = normalizeOptionalDate(toDate, 'toDate');

  if (normalizedFromDate && normalizedToDate && new Date(normalizedFromDate) > new Date(normalizedToDate)) {
    const error = new Error('ช่วงวันที่เริ่มต้นต้องไม่เกินวันที่สิ้นสุด');
    error.code = 'TAX_PERIOD_CLIENT_VALIDATION_ERROR';
    throw error;
  }

  const response = await apiClient.get('/tax/periods', {
    params: {
      branchId: normalizedBranchId,
      ...(status ? { status: String(status).trim().toUpperCase() } : {}),
      ...(normalizedFromDate ? { fromDate: normalizedFromDate } : {}),
      ...(normalizedToDate ? { toDate: normalizedToDate } : {}),
    },
  });
  return unwrapData(response);
};

export const getTaxPeriodDetail = async ({ branchId, taxPeriodId }) => {
  const normalizedBranchId = requirePositiveId(branchId, 'branchId');
  const normalizedTaxPeriodId = requireTextId(taxPeriodId, 'taxPeriodId');

  const response = await apiClient.get(`/tax/periods/${encodeURIComponent(normalizedTaxPeriodId)}`, {
    params: { branchId: normalizedBranchId },
  });
  return unwrapData(response);
};

export const ensureMonthlyTaxPeriod = async ({ branchId, referenceDate } = {}) => {
  const normalizedBranchId = requirePositiveId(branchId, 'branchId');
  const normalizedReferenceDate = normalizeOptionalDate(referenceDate, 'referenceDate');

  const response = await apiClient.post('/tax/periods/ensure', {
    branchId: normalizedBranchId,
    ...(normalizedReferenceDate ? { referenceDate: normalizedReferenceDate } : {}),
  });
  return unwrapData(response);
};

export const transitionTaxPeriod = async ({ branchId, taxPeriodId, action, occurredAt }) => {
  const normalizedBranchId = requirePositiveId(branchId, 'branchId');
  const normalizedTaxPeriodId = requireTextId(taxPeriodId, 'taxPeriodId');
  const normalizedAction = requireAction(action);
  const normalizedOccurredAt = normalizeOptionalDate(occurredAt, 'occurredAt');

  const response = await apiClient.post(`/tax/periods/${encodeURIComponent(normalizedTaxPeriodId)}/${normalizedAction.toLowerCase()}`, {
    branchId: normalizedBranchId,
    ...(normalizedOccurredAt ? { occurredAt: normalizedOccurredAt } : {}),
  });
  return unwrapData(response);
};

export const getTaxPeriodErrorMessage = (error) => {
  const responseData = error?.response?.data;
  const code =
    error?.code ||
    responseData?.code ||
    responseData?.error?.code ||
    responseData?.details?.code;
  const message =
    error?.friendlyMessage ||
    responseData?.message ||
    responseData?.error?.message ||
    responseData?.details?.message ||
    error?.message;

  const messages = {
    TAX_PERIOD_CLIENT_VALIDATION_ERROR: message || 'ข้อมูลรอบภาษีไม่ถูกต้อง',
    TAX_PERIOD_ADMINISTRATIVE_ACCESS_FORBIDDEN: 'บัญชีนี้ไม่มีสิทธิ์จัดการรอบภาษี',
    TAX_PERIOD_ADMINISTRATIVE_BRANCH_FORBIDDEN: 'ไม่สามารถจัดการรอบภาษีของสาขาอื่นได้',
    TAX_PERIOD_NOT_FOUND: 'ไม่พบรอบภาษีที่เลือก',
    TAX_PERIOD_TRANSITION_FORBIDDEN: 'สถานะปัจจุบันไม่อนุญาตให้ทำรายการนี้',
    TAX_PERIOD_LIFECYCLE_CONFLICT: 'ข้อมูลรอบภาษีมีการเปลี่ยนแปลง กรุณาโหลดใหม่',
    TAX_PERIOD_ALREADY_EXISTS: 'รอบภาษีของช่วงเวลานี้มีอยู่แล้ว',
    TAX_PERIOD_INVALID_DATE_RANGE: 'ช่วงวันที่ของรอบภาษีไม่ถูกต้อง',
    TAX_PERIOD_BRANCH_REQUIRED: 'กรุณาเลือกสาขาก่อนดำเนินการ',
    NETWORK_ERROR: 'ไม่สามารถเชื่อมต่อระบบรอบภาษีได้ กรุณาตรวจสอบเครือข่าย',
    ECONNABORTED: 'ระบบรอบภาษีตอบสนองช้าเกินไป กรุณาลองใหม่',
  };

  if (!error?.response && !code && error?.request) {
    return 'ไม่สามารถเชื่อมต่อระบบรอบภาษีได้ กรุณาตรวจสอบว่า Backend ทำงานอยู่';
  }

  return messages[code] || message || 'ไม่สามารถดำเนินการเกี่ยวกับรอบภาษีได้';
};
