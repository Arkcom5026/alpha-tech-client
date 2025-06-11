import apiClient from '@/utils/apiClient';

// ✅ สร้างการชำระเงินให้ Supplier (พร้อมแนบไฟล์ได้)
export const createSupplierPayment = async (formData) => {
  try {
    const res = await apiClient.post('/purchase-order-payments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
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
    const res = await apiClient.get('/purchase-order-payments');
    return res.data;
  } catch (err) {
    console.error('❌ [getAllSupplierPayments] error:', err);
    throw err;
  }
};

// ✅ ดึงการชำระเงินของ PO รายการเดียว
export const getSupplierPaymentsByPO = async (poId) => {
  try {
    const res = await apiClient.get(`/purchase-order-payments/by-po/${poId}`);
    return res.data;
  } catch (err) {
    console.error('❌ [getSupplierPaymentsByPO] error:', err);
    throw err;
  }
};

// ✅ ลบรายการการชำระเงิน
export const deleteSupplierPayment = async (paymentId) => {
  try {
    const res = await apiClient.delete(`/purchase-order-payments/${paymentId}`);
    return res.data;
  } catch (err) {
    console.error('❌ [deleteSupplierPayment] error:', err);
    throw err;
  }
};
