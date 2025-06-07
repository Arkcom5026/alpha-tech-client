import apiClient from '@/utils/apiClient';

// ✅ 1. เพิ่มการชำระเงินใหม่
export const submitPayment = async (saleId, paymentData) => {
  try {
    const res = await apiClient.post(`/payments`, {
      ...paymentData,
      saleId,
    });
    return res.data;
  } catch (err) {
    console.error('❌ [submitPayment] error:', err);
    throw err.response?.data || { message: 'ไม่สามารถบันทึกการชำระเงินได้' };
  }
};

// ✅ 2. ดึงรายการชำระเงินทั้งหมดของใบขาย
export const getPaymentsBySaleId = async (saleId) => {
  try {
    const res = await apiClient.get(`/payments?saleId=${saleId}`);
    return res.data;
  } catch (err) {
    console.error('❌ [getPaymentsBySaleId] error:', err);
    throw err.response?.data || { message: 'ไม่สามารถโหลดรายการชำระเงินได้' };
  }
};

// ✅ 3. แก้ไขการชำระเงิน (เช่น เปลี่ยนยอด หรือบันทึกหมายเหตุ)
export const updatePayment = async (paymentId, updates) => {
  try {
    const res = await apiClient.put(`/payments/${paymentId}`, updates);
    return res.data;
  } catch (err) {
    console.error('❌ [updatePayment] error:', err);
    throw err.response?.data || { message: 'ไม่สามารถแก้ไขข้อมูลการชำระเงินได้' };
  }
};

// ✅ 4. ลบ/ยกเลิกการรับเงิน
export const deletePayment = async (paymentId) => {
  try {
    const res = await apiClient.delete(`/payments/${paymentId}`);
    return res.data;
  } catch (err) {
    console.error('❌ [deletePayment] error:', err);
    throw err.response?.data || { message: 'ไม่สามารถลบการชำระเงินได้' };
  }
};

