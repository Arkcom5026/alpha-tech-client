import { completeSaleReturn } from '../api/saleReturnApi';
import { buildSaleReturnCommand } from '../builders/saleReturnCommandBuilder';
import {
  clearSaleReturnIdentity,
  getSaleReturnIdentity,
} from './saleReturnIdentity';

export const runCompleteSaleReturn = async ({
  saleId,
  reason,
  projection,
  refunds,
}) => {
  const materialPayload = {
    saleId: Number(saleId),
    reason: String(reason || '').trim(),
    items: projection.selectedItems,
    refunds,
  };
  const identity = getSaleReturnIdentity(saleId, materialPayload);
  const command = buildSaleReturnCommand({
    commandId: identity.commandId,
    saleId,
    reason,
    projection,
    refunds,
  });
  const result = await completeSaleReturn(command);
  clearSaleReturnIdentity(saleId);
  return result;
};
