import apiClient from '@/utils/apiClient';

const unwrapData = (response) => response?.data?.data ?? response?.data;

const positiveId = (value, fieldName) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    const error = new Error(`${fieldName} ไม่ถูกต้อง`);
    error.code = 'WHT_CLIENT_VALIDATION_ERROR';
    throw error;
  }
  return parsed;
};

const text = (value, fieldName) => {
  const normalized = String(value || '').trim();
  if (!normalized) {
    const error = new Error(`${fieldName} ไม่ถูกต้อง`);
    error.code = 'WHT_CLIENT_VALIDATION_ERROR';
    throw error;
  }
  return normalized;
};

const formType = (value) => {
  const normalized = text(value, 'formType').toUpperCase();
  if (!['PND3', 'PND53'].includes(normalized)) {
    const error = new Error('formType ต้องเป็น PND3 หรือ PND53');
    error.code = 'WHT_CLIENT_VALIDATION_ERROR';
    throw error;
  }
  return normalized;
};

export const getWithholdingTaxWorkspace = async ({ branchId, taxPeriodId }) => {
  const response = await apiClient.get(`/tax/withholding-tax/${encodeURIComponent(text(taxPeriodId, 'taxPeriodId'))}`, {
    params: { branchId: positiveId(branchId, 'branchId') },
  });
  return unwrapData(response);
};

export const issueWithholdingCertificate = async ({ branchId, taxPeriodId, taxExpenseId, formType: requestedForm }) => {
  const response = await apiClient.post(`/tax/withholding-tax/${encodeURIComponent(text(taxPeriodId, 'taxPeriodId'))}/certificates/issue`, {
    branchId: positiveId(branchId, 'branchId'),
    taxExpenseId: positiveId(taxExpenseId, 'taxExpenseId'),
    formType: formType(requestedForm),
  });
  return unwrapData(response);
};

export const prepareWithholdingFiling = async ({ branchId, taxPeriodId, formType: requestedForm }) => {
  const normalizedForm = formType(requestedForm);
  const response = await apiClient.post(`/tax/withholding-tax/${encodeURIComponent(text(taxPeriodId, 'taxPeriodId'))}/filings/${normalizedForm}/prepare`, {
    branchId: positiveId(branchId, 'branchId'),
  });
  return unwrapData(response);
};

export const submitWithholdingFiling = async ({ branchId, taxPeriodId, formType: requestedForm, reference, note }) => {
  const normalizedForm = formType(requestedForm);
  const response = await apiClient.post(`/tax/withholding-tax/${encodeURIComponent(text(taxPeriodId, 'taxPeriodId'))}/filings/${normalizedForm}/submit`, {
    branchId: positiveId(branchId, 'branchId'),
    evidence: {
      reference: text(reference, 'submission reference'),
      note: String(note || '').trim() || null,
      channel: 'MANUAL_EXTERNAL_FILING',
    },
  });
  return unwrapData(response);
};

export const getWithholdingTaxErrorMessage = (error) => {
  const responseData = error?.response?.data;
  const code = error?.code || responseData?.code || responseData?.error?.code;
  const message = responseData?.message || responseData?.error?.message || error?.message;
  const messages = {
    WHT_CLIENT_VALIDATION_ERROR: message || 'ข้อมูล WHT ไม่ถูกต้อง',
    WHT_ACCESS_FORBIDDEN: 'บัญชีนี้ไม่มีสิทธิ์จัดการภาษีหัก ณ ที่จ่าย',
    WHT_BRANCH_FORBIDDEN: 'ไม่สามารถจัดการ WHT ของสาขาอื่นได้',
    WHT_ITEMS_NOT_WITHHELD: 'ต้องประเมินรายการ WHT เป็น WITHHELD ให้ครบก่อนออกหนังสือรับรอง',
    WHT_ISSUER_PROFILE_REQUIRED: 'ต้องตั้งค่า Tax Issuer Profile ให้พร้อมก่อนออกหนังสือรับรอง',
    WHT_FORM_TYPE_MISMATCH: 'ประเภทแบบ ภ.ง.ด. ไม่ตรงกับประเภทผู้รับเงิน',
    WHT_CERTIFICATE_ALREADY_FILED: 'รายการนี้ถูกนำไปยื่นแล้ว จึงแก้หนังสือรับรองไม่ได้',
    WHT_FILING_NO_CERTIFIED_RECORDS: 'ยังไม่มีหนังสือรับรองที่พร้อมสำหรับแบบนี้',
    WHT_FILING_NOT_PREPARED: 'ต้องเตรียม filing ก่อนยืนยันการยื่น',
    WHT_SUBMISSION_EVIDENCE_REQUIRED: 'กรุณาระบุเลขอ้างอิง/หลักฐานการยื่นภายนอก',
    WHT_PERIOD_IMMUTABLE: 'รอบภาษีนี้ยื่นแล้ว จึงแก้ WHT ไม่ได้',
  };
  return messages[code] || message || 'ไม่สามารถดำเนินการภาษีหัก ณ ที่จ่ายได้';
};
