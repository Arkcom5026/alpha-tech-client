import apiClient from '@/utils/apiClient';
import { searchPrintableSales } from '@/features/sales/history/api/saleHistoryApi';

const searchUnifiedDocuments = async (query) => {
  const response = await apiClient.get('/combined-billing/unified-document-history', { params: query });
  return response.data;
};

export const searchSaleDocuments = async (query = {}) => {
  if (!query?.documentPurpose) return searchPrintableSales(query);

  try {
    return await searchUnifiedDocuments(query);
  } catch (error) {
    // Compatibility with a server that has not received the unified document
    // bridge yet. Existing Sale-based history remains usable during rollout.
    if (Number(error?.response?.status) !== 404) throw error;
    return searchPrintableSales(query);
  }
};
