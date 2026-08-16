import { searchPrintableSales } from '@/features/sales/history/api/saleHistoryApi';

export const searchSaleDocuments = async (query) => {
  return searchPrintableSales(query);
};
