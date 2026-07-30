import apiClient from '@/utils/apiClient';

export const finalizeReceiptApi = async ({ receiptId }) => {
  const response = await apiClient.patch(
    `/purchase-order-receipts/${receiptId}/finalize`,
  );

  return response?.data;
};
