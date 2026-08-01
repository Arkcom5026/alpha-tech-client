import { executeSaleCompletion } from '../../workflows/saleCompletionWorkflow';
import { projectHeldCartCompletionGuard } from '../../held-cart';
import { buildSaleCompletionPayload } from '../services/saleCompletionPayload';
import { validateSaleCompletion } from '../services/saleCompletionValidation';

export const executeCreateSaleCompletion = async ({
  saleItems,
  customerId,
  saleMode,
  options = {},
  isSubmitting,
  activeHeldCart,
  persistHeldCart,
  cancelHeldCartScheduled,
  revalidateHeldCart,
  setHeldCartValidation,
}) => {
  const precondition = validateSaleCompletion({
    saleItems,
    saleMode,
    customerId,
    isSubmitting,
  });
  if (!precondition.ok) return precondition;

  if (activeHeldCart?.id) {
    cancelHeldCartScheduled();
    const saved = await persistHeldCart(saleItems);
    const validation = await revalidateHeldCart(saved.id);
    setHeldCartValidation(validation);
    const guard = projectHeldCartCompletionGuard(validation);
    if (!guard.ready) return guard;
  }

  const data = await executeSaleCompletion({
    sale: buildSaleCompletionPayload({
      saleItems,
      customerId,
      activeHeldCart,
      saleMode,
      options,
    }),
    payment: options.paymentIntent || { paymentItems: [] },
    onIdentity: options.onCompletionIdentity,
    onFailure: options.onCompletionFailure,
  });

  const saleId = data?.saleId ?? data?.id ?? data?.sale?.id ?? null;
  return {
    saleId,
    data,
    recovery: data?.completionRecovery,
    deliveryNoteMode: saleMode === 'CREDIT' ? 'PRINT' : undefined,
  };
};
