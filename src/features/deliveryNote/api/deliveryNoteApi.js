// ✅ deliveryNoteApi.js
import apiClient from '@/utils/apiClient';

export const searchPrintablePayments = async (query = {}) => {
  try {
    const res = await apiClient.get('/payments/printable', { params: query });
    console.log('searchPrintablePayments : ', res);
    return res.data;
  } catch (err) {
    console.error('❌ [searchPrintablePayments] error:', err);
    throw err.response?.data || { message: 'ไม่สามารถค้นหารายการพิมพ์บิลได้' };
  }
};
