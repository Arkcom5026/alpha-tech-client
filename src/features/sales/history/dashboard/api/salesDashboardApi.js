import { searchPrintableSales } from '../../api/saleHistoryApi';

export const fetchSalesDashboardRows = async ({
  fromDate,
  toDate,
  limit,
} = {}) => searchPrintableSales({
  fromDate,
  toDate,
  keyword: '',
  limit,
});
