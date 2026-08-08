import apiClient from '@/utils/apiClient';

export const INPUT_TAX_PERIOD_VIEWS = Object.freeze(['DOCUMENT', 'RECEIVED', 'CLAIM', 'FILED']);

const unwrapData = (response) => response?.data?.data ?? response?.data;

const requirePositiveId = (value, fieldName) => {
  const normalized = Number(value);
  if (!Number.isInteger(normalized) || normalized <= 0) {
    const error = new Error(`${fieldName} ไม่ถูกต้อง`);
    error.code = 'INPUT_TAX_CONTROL_CENTER_CLIENT_VALIDATION_ERROR';
    throw error;
  }
  return normalized;
};

const requireDate = (value, fieldName) => {
  const normalized = String(value || '').trim();
  const date = new Date(normalized);
  if (!normalized || Number.isNaN(date.getTime())) {
    const error = new Error(`${fieldName} ไม่ถูกต้อง`);
    error.code = 'INPUT_TAX_CONTROL_CENTER_CLIENT_VALIDATION_ERROR';
    throw error;
  }
  return normalized;
};

const requirePeriodView = (value) => {
  const normalized = String(value || 'DOCUMENT').trim().toUpperCase();
  if (!INPUT_TAX_PERIOD_VIEWS.includes(normalized)) {
    const error = new Error('มุมมองช่วงเวลาภาษีซื้อไม่ถูกต้อง');
    error.code = 'INPUT_TAX_CONTROL_CENTER_CLIENT_VALIDATION_ERROR';
    throw error;
  }
  return normalized;
};

export const getInputTaxControlCenterOverview = async ({
  branchId,
  periodView = 'DOCUMENT',
  periodFrom,
  periodTo,
} = {}) => {
  const normalizedBranchId = requirePositiveId(branchId, 'branchId');
  const normalizedPeriodView = requirePeriodView(periodView);
  const normalizedPeriodFrom = requireDate(periodFrom, 'periodFrom');
  const normalizedPeriodTo = requireDate(periodTo, 'periodTo');

  if (new Date(normalizedPeriodFrom) > new Date(normalizedPeriodTo)) {
    const error = new Error('วันที่เริ่มต้นต้องไม่เกินวันที่สิ้นสุด');
    error.code = 'INPUT_TAX_CONTROL_CENTER_CLIENT_VALIDATION_ERROR';
    throw error;
  }

  const response = await apiClient.get('/tax/input-documents/overview', {
    params: {
      branchId: normalizedBranchId,
      periodView: normalizedPeriodView,
      periodFrom: normalizedPeriodFrom,
      periodTo: normalizedPeriodTo,
    },
  });

  return unwrapData(response);
};

export const getInputTaxControlCenterErrorMessage = (error) => {
  const responseData = error?.response?.data;
  const code = error?.code
    || responseData?.code
    || responseData?.error?.code
    || responseData?.details?.code;
  const message = error?.friendlyMessage
    || responseData?.message
    || responseData?.error?.message
    || responseData?.details?.message
    || error?.message;

  const messages = {
    INPUT_TAX_CONTROL_CENTER_CLIENT_VALIDATION_ERROR: message || 'ข้อมูลช่วงภาษีซื้อไม่ถูกต้อง',
    INPUT_TAX_OVERVIEW_BRANCH_FORBIDDEN: 'ไม่สามารถดูข้อมูลภาษีซื้อของสาขาอื่นได้',
    TAX_ADMINISTRATIVE_ACCESS_FORBIDDEN: 'บัญชีนี้ไม่มีสิทธิ์เข้าถึงข้อมูลภาษีซื้อ',
    NETWORK_ERROR: 'ไม่สามารถเชื่อมต่อระบบภาษีซื้อได้ กรุณาตรวจสอบเครือข่าย',
    ECONNABORTED: 'ระบบภาษีซื้อตอบสนองช้าเกินไป กรุณาลองใหม่',
  };

  if (!error?.response && !code && error?.request) {
    return 'ไม่สามารถเชื่อมต่อระบบภาษีซื้อได้ กรุณาตรวจสอบว่า Backend ทำงานอยู่';
  }

  return messages[code] || message || 'ไม่สามารถโหลดภาพรวมภาษีซื้อได้';
};
