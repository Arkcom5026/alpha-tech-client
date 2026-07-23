// Public compatibility surface. Implementations are owned by workflow modules.
export { createSaleOrder } from '../create/api/saleCreateApi';
export { submitSaleCompletion as completeSaleOrder } from '../create/api/saleCompletionApi';
export {
  getAllSales,
  getSaleById,
  markSaleAsPaid,
  searchPrintableSales,
} from '../history/api/saleHistoryApi';
export {
  updateSaleDocumentDescriptions,
  updateSaleDocumentLines,
} from '../documents/api/saleDocumentApi';
export { getSaleReturns, returnSale } from '../return/api/saleReturnApi';
export { convertOrderOnlineToSale } from '../online/api/saleOnlineConversionApi';
export { updateCustomer } from '../shared/api/saleCustomerCompatibilityApi';
