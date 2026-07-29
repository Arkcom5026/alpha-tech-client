import { searchPrintableSales } from '@/features/sales/api/saleApi';

export const searchSaleDocuments = async (query) => {
  return searchPrintableSales(query);
};
