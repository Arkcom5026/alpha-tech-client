import { useCallback, useEffect, useRef } from 'react';
import {
  deriveStockItemFocusTarget,
  STOCK_ITEM_FOCUS_TARGET,
} from '../policies/stockItemScanWorkflowPolicy';

export const useStockItemScanFocusController = ({
  barcodeInputRef,
  serialInputRef,
  searchInputRef,
  editSerialInputRef,
} = {}) => {
  const scheduledFocusRef = useRef(null);

  const cancelScheduledFocus = useCallback(() => {
    if (scheduledFocusRef.current == null) return;
    cancelAnimationFrame(scheduledFocusRef.current);
    scheduledFocusRef.current = null;
  }, []);

  const resolveTargetRef = useCallback((target) => {
    if (target === STOCK_ITEM_FOCUS_TARGET.SEARCH) return searchInputRef;
    if (target === STOCK_ITEM_FOCUS_TARGET.SERIAL) return serialInputRef;
    if (target === STOCK_ITEM_FOCUS_TARGET.EDIT_SERIAL) return editSerialInputRef;
    if (target === STOCK_ITEM_FOCUS_TARGET.BARCODE) return barcodeInputRef;
    return null;
  }, [barcodeInputRef, editSerialInputRef, searchInputRef, serialInputRef]);

  const scheduleFocus = useCallback((target, { select = true } = {}) => {
    cancelScheduledFocus();
    if (!target || target === STOCK_ITEM_FOCUS_TARGET.NONE) return;

    scheduledFocusRef.current = requestAnimationFrame(() => {
      scheduledFocusRef.current = null;
      const targetRef = resolveTargetRef(target);
      const element = targetRef?.current;
      if (!element || element.disabled) return;
      element.focus?.();
      if (select) element.select?.();
    });
  }, [cancelScheduledFocus, resolveTargetRef]);

  const focusForState = useCallback((state) => {
    const target = deriveStockItemFocusTarget(state);
    scheduleFocus(target);
    return target;
  }, [scheduleFocus]);

  useEffect(() => () => cancelScheduledFocus(), [cancelScheduledFocus]);

  return {
    cancelScheduledFocus,
    scheduleFocus,
    focusForState,
  };
};

export default useStockItemScanFocusController;
