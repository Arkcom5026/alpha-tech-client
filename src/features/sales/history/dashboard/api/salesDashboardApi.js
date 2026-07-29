import { searchPrintableSales } from '../../../api/saleApi';

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
