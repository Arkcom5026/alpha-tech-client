import apiClient from '@/utils/apiClient';

const unwrap = (response) => response?.data?.data ?? response?.data;

export const listSupplierDisputes = async ({ payableId } = {}) => {
  const response = await apiClient.get('/supplier-payables/disputes', {
    params: payableId ? { payableId } : {},
  });
  return unwrap(response);
};
export const openSupplierDispute = async ({ payableId, ...payload }) => unwrap(
  await apiClient.post(`/supplier-payables/${payableId}/disputes`, payload),
);
export const createSupplierAdjustment = async ({ payableId, ...payload }) => unwrap(
  await apiClient.post(`/supplier-payables/${payableId}/adjustments`, payload),
);
export const resolveSupplierDispute = async ({ disputeId, ...payload }) => unwrap(
  await apiClient.post(`/supplier-payables/disputes/${disputeId}/resolve`, payload),
);
export const voidSupplierAdjustment = async ({ adjustmentId, reason }) => unwrap(
  await apiClient.post(`/supplier-payables/adjustments/${adjustmentId}/void`, { reason }),
);

export const getSupplierDisputeErrorMessage = (error) => {
  const body = error?.response?.data;
  const code = body?.error?.code || body?.code;
  const message = body?.error?.message || body?.message || error?.message;
  const messages = {
    SUPPLIER_DISPUTE_ALREADY_OPEN: 'รายการเจ้าหนี้นี้มีข้อโต้แย้งที่ยังไม่จบอยู่แล้ว',
    SUPPLIER_DISPUTE_EXCEEDS_OUTSTANDING: 'ยอดที่โต้แย้งมากกว่ายอดหนี้คงเหลือ',
    SUPPLIER_ADJUSTMENT_EXCEEDS_BALANCE: 'Credit Adjustment มากกว่ายอดที่ยังไม่ได้ชำระ',
    SUPPLIER_ADJUSTMENT_REVERSAL_CONFLICT: 'ไม่สามารถย้อน Adjustment ได้ เพราะมีการชำระที่ทำให้ยอดขัดแย้ง',
    SUPPLIER_ADJUSTMENT_VOID_FORBIDDEN: 'การย้อน Adjustment ต้องใช้สิทธิ์ OWNER',
  };
  return messages[code] || message || 'ไม่สามารถดำเนินการข้อโต้แย้งหรือปรับยอดได้';
};
