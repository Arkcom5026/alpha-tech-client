// refund/api/refundApi.js
import apiClient from '@/utils/apiClient';

export const createRefundTransaction = async (data) => {
  try {
    const res = await apiClient.post('/refunds/create', data);
    return res.data;
  } catch (err) {
    console.error('❌ createRefundTransaction error:', err);
    throw err;
  }
};
