import apiClient from '@/utils/apiClient';

// ✅ สร้างการชำระเงินให้ Supplier (รองรับการผูก PO)
export const createSupplierPayment = async (data) => {
  try {
    const res = await apiClient.post('/supplier-payments', {
      supplierId: data.supplierId,
      paymentDate: data.paymentDate,
      amount: data.amount,
      method: data.method,
      paymentType: data.paymentType,
      note: data.note,
      debitAmount: data.debitAmount,
      creditAmount: data.creditAmount,
      pos: data.pos || [], // ✅ เพิ่มการส่ง pos ให้รองรับ PO BASED
    });
    return res.data;
  } catch (err) {
    console.error('❌ [createSupplierPayment] error:', err);
    throw err;
  }
};

// ✅ ดึงการชำระเงินทั้งหมด (รายงานรวม)
export const getAllSupplierPayments = async () => {
  try {
    const res = await apiClient.get('/supplier-payments');
    return res.data;
  } catch (err) {
    console.error('❌ [getAllSupplierPayments] error:', err);
    throw err;
  }
};

// ✅ ดึงการชำระเงินของ PO รายการเดียว (ถ้ามีการผูก PO)
export const getSupplierPaymentsByPO = async (poId) => {
  try {
    const res = await apiClient.get(`/supplier-payments/by-po/${poId}`);
    return res.data;
  } catch (err) {
    console.error('❌ [getSupplierPaymentsByPO] error:', err);
    throw err;
  }
};

// ✅ ลบรายการการชำระเงิน
export const deleteSupplierPayment = async (paymentId) => {
  try {
    const res = await apiClient.delete(`/supplier-payments/${paymentId}`);
    return res.data;
  } catch (err) {
    console.error('❌ [deleteSupplierPayment] error:', err);
    throw err;
  }
};

// ✅ ดึงยอดมัดจำที่ยังไม่ได้ผูกกับ PO
export const getAdvancePaymentsBySupplier = async (supplierId) => {
  try {
    const res = await apiClient.get(`/supplier-payments/advance?supplierId=${supplierId}`);
    return res.data;
  } catch (error) {
    console.error('❌ getAdvancePaymentsBySupplier error:', error);
    return [];
  }
};
