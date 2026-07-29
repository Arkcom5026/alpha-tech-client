import { useCallback } from 'react';

import { executeSaleHeldCartLoad } from '../controllers/saleHeldCartLoadController';

export const useSaleHeldCartRecovery = ({
  getHeldCart,
  revalidateHeldCart,
  setSaleItems,
  setCustomerId,
  setSelectedPriceType,
  setActiveCart,
  setValidation,
  setSaveState,
  closePanel,
  setError,
  getErrorMessage,
  productSearchRef,
}) => {
  const revalidate = useCallback(
    (heldCartId) => revalidateHeldCart(heldCartId),
    [revalidateHeldCart]
  );

  const load = useCallback(async (heldCartId) => {
    const result = await executeSaleHeldCartLoad({
      heldCartId,
      getHeldCart,
      revalidateHeldCart,
    });

    if (!result.ok) {
      setError(`❌ ${getErrorMessage(result.error)}`);
      return result;
    }

    setActiveCart(result.cart);
    setValidation(result.validation);
    setSaleItems(result.saleItems);
    setSelectedPriceType(result.priceType);
    setCustomerId?.(result.customerId);
    setSaveState('saved');
    closePanel();
    setError(result.warning);
    requestAnimationFrame(() => productSearchRef?.current?.focus?.());

    return result;
  }, [
    closePanel,
    getErrorMessage,
    getHeldCart,
    productSearchRef,
    revalidateHeldCart,
    setActiveCart,
    setCustomerId,
    setError,
    setSaleItems,
    setSaveState,
    setSelectedPriceType,
    setValidation,
  ]);

  return { load, revalidate };
};
