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
  };
  return messages[code] || message || 'ไม่สามารถดำเนินการรายการเจ้าหนี้ได้';
};
