import apiClient from '@/utils/apiClient';

export const submitSaleCompletion = async (command) => {
  try {
    const response = await apiClient.post('/sales/complete', command);
    return response.data;
  } catch (error) {
    const payload = error?.response?.data;
    const wrapped = new Error(payload?.message || payload?.error || 'ไม่สามารถยืนยันการขายได้');
    wrapped.code = payload?.code;
    wrapped.details = payload?.details;
    wrapped.status = error?.response?.status;
    wrapped.response = error?.response;
    throw wrapped;
  }
};
