import apiClient from '@/utils/apiClient';

const unwrap = (response) => response?.data?.data ?? response?.data;

export const listSupplierAdvances = async ({ supplierId, status } = {}) => {
  const response = await apiClient.get('/supplier-advances', {
    params: {
      ...(supplierId ? { supplierId } : {}),
      ...(status ? { status } : {}),
    },
  });
  return unwrap(response);
};

export const createSupplierAdvance = async (payload) => {
  const response = await apiClient.post('/supplier-advances', payload);
  return unwrap(response);
};

export const applySupplierAdvance = async ({ advanceId, supplierId, allocations }) => {
  const response = await apiClient.post(`/supplier-advances/${advanceId}/apply`, {
    supplierId,
    allocations,
  });
  return unwrap(response);
};

export const activateLegacySupplierAdvance = async ({ advanceId, availableAmount }) => {
  const response = await apiClient.post(`/supplier-advances/${advanceId}/activate`, {
    availableAmount,
  });
  return unwrap(response);
};

export const voidSupplierAdvance = async ({ advanceId, reason }) => {
  const response = await apiClient.post(`/supplier-advances/${advanceId}/void`, { reason });
  return unwrap(response);
};

export const getSupplierAdvanceErrorMessage = (error) => {
  const body = error?.response?.data;
  const code = body?.error?.code || body?.code;
  const message = body?.error?.message || body?.message || error?.message;
  const messages = {
    SUPPLIER_ADVANCE_EXCEEDS_AVAILABLE: 'ยอดที่ใช้เกินยอด Advance คงเหลือ',
    SUPPLIER_ADVANCE_EXCEEDS_OUTSTANDING: 'ยอด Advance ที่จัดสรรเกินยอดเจ้าหนี้คงค้าง',
    SUPPLIER_ADVANCE_PAYABLE_CONFLICT: 'รายการเจ้าหนี้บางรายการเปลี่ยนสถานะแล้ว กรุณาโหลดใหม่',
    SUPPLIER_ADVANCE_REVIEW_CONFLICT: 'Advance รายการนี้ไม่ได้อยู่ในสถานะรอตรวจสอบ',
    SUPPLIER_ADVANCE_AVAILABLE_INVALID: 'ยอด Advance ที่รับรองไม่ถูกต้อง',
    SUPPLIER_ADVANCE_VOID_REASON_REQUIRED: 'กรุณาระบุเหตุผลในการยกเลิก Advance',
    SUPPLIER_ADVANCE_ACTIVATE_FORBIDDEN: 'การรับรอง Advance เดิมต้องใช้สิทธิ์ OWNER',
    SUPPLIER_ADVANCE_VOID_FORBIDDEN: 'การยกเลิก Advance ต้องใช้สิทธิ์ OWNER',
  };
  return messages[code] || message || 'ไม่สามารถดำเนินการเงินจ่ายล่วงหน้า Supplier ได้';
};
