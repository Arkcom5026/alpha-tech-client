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

export const getVatCarryForwardAuthority = async ({ branchId, taxPeriodId }) => {
  const normalizedBranchId = requirePositiveId(branchId, 'branchId');
  const normalizedTaxPeriodId = requireText(taxPeriodId, 'taxPeriodId');
  const response = await apiClient.get(`/tax/vat-carry-forward/${encodeURIComponent(normalizedTaxPeriodId)}`, {
    params: { branchId: normalizedBranchId },
  });
  return unwrapData(response);
};

export const confirmVatCarryForwardAuthority = async ({
  branchId,
  taxPeriodId,
  sourceType,
  amount,
  note,
}) => {
  const normalizedBranchId = requirePositiveId(branchId, 'branchId');
  const normalizedTaxPeriodId = requireText(taxPeriodId, 'taxPeriodId');
  const normalizedSourceType = requireText(sourceType, 'sourceType');
  const normalizedAmount = Number(amount);
  if (!Number.isFinite(normalizedAmount) || normalizedAmount < 0) {
    const error = new Error('ยอดเครดิตยกมาไม่ถูกต้อง');
    error.code = 'VAT_SETTLEMENT_CLIENT_VALIDATION_ERROR';
    throw error;
  }
  const response = await apiClient.post(`/tax/vat-carry-forward/${encodeURIComponent(normalizedTaxPeriodId)}/confirm`, {
    branchId: normalizedBranchId,
    sourceType: normalizedSourceType,
    amount: normalizedAmount,
    note: String(note || '').trim() || null,
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
    VAT_CARRY_FORWARD_ACCESS_FORBIDDEN: 'บัญชีนี้ไม่มีสิทธิ์ยืนยันเครดิต VAT ยกมา',
    VAT_CARRY_FORWARD_BRANCH_FORBIDDEN: 'ไม่สามารถจัดการเครดิต VAT ยกมาของสาขาอื่นได้',
    VAT_CARRY_FORWARD_PREVIOUS_PERIOD_NOT_FINALIZED: 'ต้องล็อกหรือยื่นรอบภาษีก่อนหน้าก่อนยืนยันเครดิตยกมา',
    VAT_CARRY_FORWARD_SOURCE_SETTLEMENT_NOT_READY: 'ยอด ภ.พ.30 ของรอบก่อนยังไม่พร้อม จึงยังยืนยันเครดิตยกมาไม่ได้',
    VAT_CARRY_FORWARD_AMOUNT_EXCEEDS_SOURCE_CREDIT: 'ยอดเครดิตยกมาต้องไม่เกินเครดิต VAT คงเหลือของรอบก่อน',
    VAT_CARRY_FORWARD_PERIOD_IMMUTABLE: 'รอบภาษีนี้ยื่นแล้ว จึงแก้เครดิตยกมาไม่ได้',
    VAT_CARRY_FORWARD_HISTORICAL_OPENING_NOT_ALLOWED: 'ใช้ยอดเปิดระบบได้เฉพาะเมื่อไม่มีรอบภาษีก่อนหน้า',
    ACCOUNTING_OFFICE_PERIOD_NOT_FOUND: 'ไม่พบรอบภาษีที่เลือก',
  };
  return messages[code] || message || 'ไม่สามารถดำเนินการ VAT Settlement ได้';
};
