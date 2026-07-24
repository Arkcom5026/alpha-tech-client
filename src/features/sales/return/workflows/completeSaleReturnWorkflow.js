import { completeSaleReturn } from '../api/saleReturnApi';
import { clearSaleReturnCommandId, getSaleReturnCommandId } from './saleReturnIdentity';

export const runCompleteSaleReturn = async ({ saleId, reason, items, refunds }) => {
  const result = await completeSaleReturn({
    commandId: getSaleReturnCommandId(saleId),
    saleId: Number(saleId),
    reason: reason.trim(),
    items,
    refunds,
  });
  clearSaleReturnCommandId(saleId);
  return result;
};
