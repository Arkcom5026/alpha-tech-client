import { useCallback, useEffect, useRef } from 'react';

export const useSaleHeldCartAutosave = ({
  activeHeldCartRef,
  saleItems,
  customerId,
  selectedPriceType,
  updateHeldCart,
  setActiveCart,
  setSaveState,
  onError,
  debounceMs = 700,
}) => {
  const timerRef = useRef(null);
  const promiseRef = useRef(Promise.resolve());

  const buildSnapshot = useCallback((items = saleItems) => ({
    customerId: customerId ? Number(customerId) : null,
    customerName: activeHeldCartRef.current?.customerName || null,
    customerPhone: activeHeldCartRef.current?.customerPhone || null,
    note: activeHeldCartRef.current?.note || null,
    priceType: selectedPriceType,
    items,
  }), [activeHeldCartRef, customerId, saleItems, selectedPriceType]);

  const persist = useCallback(async (items = saleItems) => {
    const pending = promiseRef.current.then(async () => {
      const cart = activeHeldCartRef.current;
      if (!cart?.id || !items.length) return cart;
      setSaveState('saving');
      const updated = await updateHeldCart(cart.id, {
        ...buildSnapshot(items),
        expectedVersion: cart.version,
      });
      setActiveCart(updated);
      setSaveState('saved');
      return updated;
    });

    promiseRef.current = pending.catch(() => {});
    try {
      return await pending;
    } catch (error) {
      setSaveState('failed');
      throw error;
    }
  }, [activeHeldCartRef, buildSnapshot, saleItems, setActiveCart, setSaveState, updateHeldCart]);

  const cancelScheduled = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  useEffect(() => {
    const active = activeHeldCartRef.current;
    if (!active?.id || !saleItems.length) return undefined;

    cancelScheduled();
    setSaveState('pending');
    timerRef.current = setTimeout(() => {
      persist(saleItems).catch(onError);
    }, debounceMs);

    return cancelScheduled;
  }, [activeHeldCartRef, cancelScheduled, customerId, debounceMs, onError, persist, saleItems, selectedPriceType, setSaveState]);

  return {
    buildSnapshot,
    persist,
    cancelScheduled,
  };
};