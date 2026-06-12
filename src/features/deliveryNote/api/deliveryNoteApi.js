// ✅ deliveryNoteApi.js
import apiClient from '@/utils/apiClient';

export const searchPrintablePayments = async (query = {}) => {
  try {
    const res = await apiClient.get('/payments/printable', { params: query });
    return res.data;
  } catch (err) {
    console.error('❌ [searchPrintablePayments] error:', err);
    throw err.response?.data || { message: 'ไม่สามารถค้นหารายการพิมพ์บิลได้' };
  }
};

export const updateSaleDocumentDescriptions = async (saleId, payload) => {
  try {
    const res = await apiClient.put(`/sales/${saleId}/document-descriptions`, payload);
    return res.data;
  } catch (err) {
    console.error('❌ [updateSaleDocumentDescriptions] error:', err);
    throw err.response?.data || { message: 'ไม่สามารถบันทึกข้อความรายการเอกสารได้' };
  }
};