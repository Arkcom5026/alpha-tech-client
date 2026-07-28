import apiClient from '@/utils/apiClient';

const unwrap = (response) => response?.data?.data ?? response?.data;

export const listSupplierSettlements = async ({ supplierId } = {}) => {
  const response = await apiClient.get('/supplier-settlements', {
    params: supplierId ? { supplierId } : {},
  });
  return unwrap(response);
};

export const createSupplierSettlement = async (payload) => {
  const response = await apiClient.post('/supplier-settlements', payload);
  return unwrap(response);
};

export const voidSupplierSettlement = async ({ paymentId, reason }) => {
  const response = await apiClient.post(`/supplier-settlements/${paymentId}/void`, { reason });
  return unwrap(response);
};

export const getSupplierSettlementErrorMessage = (error) => {
  const body = error?.response?.data;
  const code = body?.error?.code || body?.code;
  const message = body?.error?.message || body?.message || error?.message;
  const messages = {
    SUPPLIER_PAYMENT_PAYABLE_CONFLICT: 'รายการเจ้าหนี้บางรายการถูกชำระหรือเปลี่ยนสถานะแล้ว กรุณาโหลดใหม่',
    SUPPLIER_PAYMENT_ALLOCATION_EXCEEDS_OUTSTANDING: 'ยอดที่จัดสรรเกินยอดคงค้างของรายการเจ้าหนี้',
    SUPPLIER_PAYMENT_ALLOCATIONS_REQUIRED: 'กรุณาเลือกยอดเจ้าหนี้สำหรับชำระ',
    SUPPLIER_PAYMENT_METHOD_INVALID: 'วิธีชำระเงินไม่ถูกต้อง',
    SUPPLIER_PAYMENT_DATE_INVALID: 'วันที่ชำระเงินไม่ถูกต้อง',
    SUPPLIER_PAYMENT_VOID_REASON_REQUIRED: 'กรุณาระบุเหตุผลในการยกเลิก',
    SUPPLIER_PAYMENT_VOID_FORBIDDEN: 'การยกเลิกรายการชำระต้องใช้สิทธิ์ OWNER',
    SUPPLIER_PAYMENT_REVERSAL_CONFLICT: 'ไม่สามารถย้อนรายการนี้ได้ เนื่องจากสถานะเจ้าหนี้เปลี่ยนแล้ว',
  };
  return messages[code] || message || 'ไม่สามารถดำเนินการชำระ Supplier ได้';
};
