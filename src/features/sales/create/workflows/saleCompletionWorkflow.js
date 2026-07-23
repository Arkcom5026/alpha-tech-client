import { submitSaleCompletion } from '../api/saleCompletionApi';
import {
  clearSaleCompletionIdentity,
  getSaleCompletionIdentity,
} from './saleCompletionIdentity';

export const executeSaleCompletion = async ({
  sale,
  payment,
  storage = globalThis.sessionStorage,
  onIdentity,
}) => {
  const materialPayload = { sale, payment };
  const identity = getSaleCompletionIdentity(materialPayload, storage);
  onIdentity?.(identity);
  const result = await submitSaleCompletion({
    commandId: identity.commandId,
    sale,
    payment: {
      ...payment,
      receivedAt: identity.receivedAt,
    },
  });
  clearSaleCompletionIdentity(storage);
  return result;
};
