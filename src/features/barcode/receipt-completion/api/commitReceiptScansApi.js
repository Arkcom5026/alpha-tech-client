import apiClient from '@/utils/apiClient';

export const commitReceiptScansApi = async ({ receiptId, items }) => {
  const response = await apiClient.post(`/receipts/${receiptId}/commit-scans`, { items });
  return response?.data;
};
