import { useCallback, useState } from 'react';

import { executeCreateSaleCompletion } from '../controllers/saleCompletionController';

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

  const confirm = useCallback(async (options = {}) => {
    clearSaleError?.();
    try {
      setIsSubmitting(true);
      return await executeCreateSaleCompletion({
        saleItems,
        customerId,
        saleMode,
        options,
        isSubmitting,
        activeHeldCart,
        persistHeldCart,
        cancelHeldCartScheduled,
        revalidateHeldCart,
        setHeldCartValidation,
      });
    } catch (error) {
      const payload = error?.response?.data;
      return {
        error: payload?.message || error?.message || 'ยืนยันการขายล้มเหลว',
        code: payload?.code || error?.code,
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

  return {
    isSubmitting,
    setIsSubmitting,
    confirm,
  };
};
