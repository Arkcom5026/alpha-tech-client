import { submitSaleCompletion } from '../api/saleCompletionApi';
import {
  clearSaleCompletionIdentity,
  getSaleCompletionIdentity,
  readSaleCompletionIdentity,
} from './saleCompletionIdentity';
import { classifySaleCompletionFailure } from '../completion/services/saleCompletionRecovery';

export const executeSaleCompletion = async ({
  sale,
  payment,
  storage = globalThis.sessionStorage,
  submit = submitSaleCompletion,
  onIdentity,
  onFailure,
}) => {
  const materialPayload = { sale, payment };
  const identity = getSaleCompletionIdentity(materialPayload, storage);
  onIdentity?.(identity);

  try {
    const result = await submit({
      commandId: identity.commandId,
      sale,
      payment: {
        ...payment,
        receivedAt: identity.receivedAt,
      },
    });
    clearSaleCompletionIdentity(storage);
    return {
      ...result,
      completionIdentity: identity,
      completionRecovery: {
        state: 'CONFIRMED',
        commandId: identity.commandId,
        retryable: false,
        preserveCheckout: false,
      },
    };
  } catch (error) {
    const failure = classifySaleCompletionFailure(error);
    const pendingIdentity = readSaleCompletionIdentity(storage) || identity;
    error.saleCompletionFailure = failure;
    error.saleCompletionIdentity = pendingIdentity;
    onFailure?.({ failure, identity: pendingIdentity, error });
    throw error;
  }
};
