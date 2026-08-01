import { useCallback, useMemo, useState } from 'react';

import { executeCreateSaleCompletion } from '../controllers/saleCompletionController';
import { projectSaleCompletionRecovery } from '../services/saleCompletionRecovery';

export const useSaleCompletion = ({
  saleItems,
  customerId,
  saleMode,
  activeHeldCart,
  persistHeldCart,
  cancelHeldCartScheduled,
  revalidateHeldCart,
  setHeldCartValidation,
  clearSaleError,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completionIdentity, setCompletionIdentity] = useState(null);
  const [completionFailure, setCompletionFailure] = useState(null);

  const confirm = useCallback(async (options = {}) => {
    if (isSubmitting) {
      return {
        error: 'กำลังยืนยันการขาย กรุณารอผลลัพธ์เดิม',
        code: 'SALE_COMPLETION_ALREADY_SUBMITTING',
      };
    }

    clearSaleError?.();
    setCompletionFailure(null);

    try {
      setIsSubmitting(true);
      const result = await executeCreateSaleCompletion({
        saleItems,
        customerId,
        saleMode,
        options: {
          ...options,
          onCompletionIdentity: setCompletionIdentity,
          onCompletionFailure: ({ failure, identity }) => {
            setCompletionIdentity(identity || null);
            setCompletionFailure(failure || null);
          },
        },
        isSubmitting: false,
        activeHeldCart,
        persistHeldCart,
        cancelHeldCartScheduled,
        revalidateHeldCart,
        setHeldCartValidation,
      });

      if (result?.saleId) {
        setCompletionFailure(null);
        setCompletionIdentity(null);
      }
      return result;
    } catch (error) {
      const payload = error?.response?.data;
      const failure = error?.saleCompletionFailure || null;
      const identity = error?.saleCompletionIdentity || null;
      if (failure) setCompletionFailure(failure);
      if (identity) setCompletionIdentity(identity);
      return {
        error: payload?.message || error?.message || 'ยืนยันการขายล้มเหลว',
        code: payload?.code || error?.code || failure?.code,
        recovery: projectSaleCompletionRecovery({ identity, failure }),
      };
    } finally {
      setIsSubmitting(false);
    }
  }, [
    saleItems,
    customerId,
    saleMode,
    isSubmitting,
    activeHeldCart,
    persistHeldCart,
    cancelHeldCartScheduled,
    revalidateHeldCart,
    setHeldCartValidation,
    clearSaleError,
  ]);

  const recovery = useMemo(
    () => projectSaleCompletionRecovery({
      identity: completionIdentity,
      failure: completionFailure,
      isSubmitting,
    }),
    [completionFailure, completionIdentity, isSubmitting]
  );

  return {
    isSubmitting,
    confirm,
    recovery,
  };
};
