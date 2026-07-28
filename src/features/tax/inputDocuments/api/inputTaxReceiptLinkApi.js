import apiClient from '@/utils/apiClient';

const unwrapData = (response) => response?.data?.data ?? response?.data;

const positiveId = (value, fieldName) => {
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) {
    const error = new Error(`${fieldName} ไม่ถูกต้อง`);
    error.code = 'INPUT_TAX_LINK_CLIENT_VALIDATION_ERROR';
    throw error;
  }
  return number;
};

const normalizeMoney = (value) => {
  const number = Number(value ?? 0);
  return Number.isFinite(number) && number >= 0 ? Number(number.toFixed(2)) : 0;
};

export const listInputTaxReceiptCandidates = async ({
  branchId,
  sourceType,
  supplierId,
  keyword,
  linkState = 'ACTION_REQUIRED',
  fromDate,
  toDate,
  limit = 200,
  offset = 0,
} = {}) => {
  const response = await apiClient.get('/tax/input-documents/pending', {
    params: {
      branchId: positiveId(branchId, 'branchId'),
      ...(sourceType ? { sourceType: String(sourceType).trim().toUpperCase() } : {}),
      ...(supplierId ? { supplierId: positiveId(supplierId, 'supplierId') } : {}),
      ...(keyword ? { keyword: String(keyword).trim() } : {}),
      ...(linkState ? { linkState: String(linkState).trim().toUpperCase() } : {}),
      ...(fromDate ? { fromDate } : {}),
      ...(toDate ? { toDate } : {}),
      limit,
      offset,
    },
  });
  return unwrapData(response);
};

export const listInputTaxDocumentReceiptLinks = async ({ branchId, taxDocumentId }) => {
  const response = await apiClient.get(
    `/tax/documents/${positiveId(taxDocumentId, 'taxDocumentId')}/receipt-links`,
    { params: { branchId: positiveId(branchId, 'branchId') } },
  );
  return unwrapData(response);
};

export const attachInputTaxDocumentReceiptLinks = async ({
  branchId,
  taxDocumentId,
  commandKey,
  receiptReferences,
}) => {
  const response = await apiClient.post(
    `/tax/documents/${positiveId(taxDocumentId, 'taxDocumentId')}/receipt-links`,
    {
      branchId: positiveId(branchId, 'branchId'),
      commandKey: String(commandKey || '').trim(),
      receiptReferences: (receiptReferences || []).map((reference) => ({
        sourceType: reference.sourceType,
        sourceId: positiveId(reference.sourceId, 'sourceId'),
        allocatedSubtotal: normalizeMoney(reference.allocatedSubtotal),
        allocatedVatAmount: normalizeMoney(reference.allocatedVatAmount),
        allocatedTotalAmount: normalizeMoney(reference.allocatedTotalAmount),
      })),
    },
  );
  return unwrapData(response);
};

export const reallocateInputTaxDocumentReceiptLink = async ({
  branchId,
  taxDocumentId,
  linkId,
  allocation,
  reason,
}) => {
  const response = await apiClient.patch(
    `/tax/documents/${positiveId(taxDocumentId, 'taxDocumentId')}/receipt-links/${positiveId(linkId, 'linkId')}`,
    {
      branchId: positiveId(branchId, 'branchId'),
      allocatedSubtotal: normalizeMoney(allocation?.allocatedSubtotal),
      allocatedVatAmount: normalizeMoney(allocation?.allocatedVatAmount),
      allocatedTotalAmount: normalizeMoney(allocation?.allocatedTotalAmount),
      ...(reason ? { reason: String(reason).trim() } : {}),
    },
  );
  return unwrapData(response);
};

export const cancelInputTaxDocumentReceiptLink = async ({
  branchId,
  taxDocumentId,
  linkId,
  reason,
}) => {
  const response = await apiClient.post(
    `/tax/documents/${positiveId(taxDocumentId, 'taxDocumentId')}/receipt-links/${positiveId(linkId, 'linkId')}/cancel`,
    {
      branchId: positiveId(branchId, 'branchId'),
      reason: String(reason || '').trim(),
    },
  );
  return unwrapData(response);
};

export const inputTaxReceiptLinkErrorMessage = (error) => {
  const responseData = error?.response?.data;
  const code = error?.code || responseData?.code || responseData?.error?.code || responseData?.error;
  const message = responseData?.message || responseData?.error?.message || error?.message;
  const messages = {
    INPUT_TAX_LINK_CLIENT_VALIDATION_ERROR: message || 'ข้อมูลไม่ถูกต้อง',
    INPUT_TAX_LINK_ACCESS_FORBIDDEN: 'บัญชีนี้ไม่มีสิทธิ์จัดการการผูกเอกสารภาษีซื้อ',
    INPUT_TAX_LINK_BRANCH_FORBIDDEN: 'ไม่สามารถจัดการข้อมูลของสาขาอื่นได้',
    INPUT_TAX_LINK_SUPPLIER_MISMATCH: 'ใบรับสินค้าที่เลือกต้องเป็น Supplier เดียวกัน',
    INPUT_TAX_LINK_ALLOCATION_EXCEEDED: 'ยอดจัดสรรรวมเกินยอดของใบรับสินค้า',
    INPUT_TAX_LINK_ALREADY_ACTIVE: 'ใบรับสินค้านี้ผูกกับเอกสารแล้ว กรุณาแก้ยอดจัดสรรเดิม',
    INPUT_TAX_LINK_PERIOD_LOCKED: 'รอบภาษีถูกล็อกหรือยื่นแล้ว ต้องใช้กระบวนการแก้ไขเอกสาร',
    INPUT_TAX_LINK_DOCUMENT_LOCKED: 'เอกสารอยู่ในสถานะที่แก้ไขโดยตรงไม่ได้',
    INPUT_TAX_LINK_CANCEL_REASON_REQUIRED: 'กรุณาระบุเหตุผลที่ยกเลิกการผูก',
    TAX_DOCUMENT_NOT_FOUND: 'ไม่พบเอกสารภาษีที่เลือก',
  };
  return messages[code] || message || 'ไม่สามารถจัดการใบรับสินค้าของเอกสารภาษีได้';
};
