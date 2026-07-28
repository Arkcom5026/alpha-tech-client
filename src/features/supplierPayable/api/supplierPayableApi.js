import apiClient from '@/utils/apiClient';

const unwrap = (response) => response?.data?.data ?? response?.data;

export const listSupplierPayables = async ({ supplierId, status } = {}) => {
  const response = await apiClient.get('/supplier-payables', {
    params: {
      ...(supplierId ? { supplierId } : {}),
      ...(status ? { status } : {}),
    },
  });
  return unwrap(response);
};

export const listSupplierPayableCandidates = async ({ supplierId } = {}) => {
  const response = await apiClient.get('/supplier-payables/candidates', {
    params: supplierId ? { supplierId } : {},
  });
  return unwrap(response);
};

export const getSupplierPayableAging = async ({ supplierId, asOf } = {}) => {
  const response = await apiClient.get('/supplier-payables/aging', {
    params: {
      ...(supplierId ? { supplierId } : {}),
      ...(asOf ? { asOf } : {}),
    },
  });
  return unwrap(response);
};

export const createSupplierPayableFromReceipts = async (payload) => {
  const response = await apiClient.post('/supplier-payables/from-receipts', payload);
  return unwrap(response);
};

export const getSupplierPayableErrorMessage = (error) => {
  const body = error?.response?.data;
  const code = body?.error?.code || body?.code;
  const message = body?.error?.message || body?.message || error?.message;
  const messages = {
    SUPPLIER_PAYABLE_RECEIPT_CONFLICT: 'มีใบรับสินค้าบางใบถูกนำไปตั้งหนี้แล้ว กรุณาโหลดข้อมูลใหม่',
    SUPPLIER_PAYABLE_SUPPLIER_MISMATCH: 'ใบรับสินค้าทั้งหมดต้องเป็นของ Supplier รายเดียวกัน',
    SUPPLIER_PAYABLE_RECEIPTS_REQUIRED: 'กรุณาเลือกใบรับสินค้าอย่างน้อยหนึ่งใบ',
    SUPPLIER_PAYABLE_DATE_INVALID: 'วันที่เอกสารหรือวันครบกำหนดไม่ถูกต้อง',
    SUPPLIER_PAYABLE_DUE_DATE_INVALID: 'วันครบกำหนดต้องไม่ก่อนวันที่เอกสาร',
    SUPPLIER_PAYABLE_TOTAL_REQUIRED: 'ใบรับสินค้าที่เลือกไม่มียอดสำหรับตั้งหนี้',
    SUPPLIER_AGING_DATE_INVALID: 'วันที่สำหรับรายงานอายุหนี้ไม่ถูกต้อง',
  };
  return messages[code] || message || 'ไม่สามารถดำเนินการรายการเจ้าหนี้ได้';
};
