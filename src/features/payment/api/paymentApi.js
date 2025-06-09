import apiClient from '@/utils/apiClient';

// ✅ 1. เพิ่มการชำระเงินใหม่ (แบบเดี่ยว)
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

// ✅ 1.1 เพิ่มการชำระเงินหลายช่องทางพร้อมกัน (multi-method)
export const submitPayments = async (paymentArray) => {
  try {
    const res = await apiClient.post(`/payments`, paymentArray);
    return res.data;
  } catch (err) {
    console.error('❌ [submitPayments] error:', err);
    throw err.response?.data || { message: 'ไม่สามารถบันทึกการชำระเงินแบบหลายช่องทางได้' };
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

// ✅ 4. ยกเลิก
export const cancelPayment = async (paymentId, note = '') => {
  const res = await apiClient.post('/payments/cancel', {
    paymentId,
    note,
  });
  return res.data;
};

// ✅ 5. ดึงข้อมูลการรับเงินมาแสดง (พร้อมรองรับการค้นหาแบบ filter)
export const searchPrintablePayments = async (query = {}) => {
  try {
    const res = await apiClient.get('/payments/printable', { params: query });
    return res.data;
  } catch (err) {
    console.error('❌ [searchPrintablePayments] error:', err);
    throw err.response?.data || { message: 'ไม่สามารถค้นหารายการพิมพ์บิลได้' };
  }
};

