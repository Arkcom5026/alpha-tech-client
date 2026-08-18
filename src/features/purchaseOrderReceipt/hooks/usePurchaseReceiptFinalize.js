import { useCallback, useMemo, useState } from 'react';

import { projectPurchaseReceiptError } from '../projections/purchaseReceiptErrorProjection';
import { projectPurchaseReceiptFinalizeState } from '../projections/purchaseReceiptFinalizeProjection';

export const usePurchaseReceiptFinalize = ({
  items = [],
  receiptId = null,
  savedRows = {},
  sessionSavedQuantity = {},
  purchaseOrderStatus = '',
  finalizeReceipt,
  onFinalized,
} = {}) => {
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [finalizedOnce, setFinalizedOnce] = useState(false);
  const [finalizeError, setFinalizeError] = useState(null);
  const [finalizedReceipt, setFinalizedReceipt] = useState(null);

  const finalizeState = useMemo(() => projectPurchaseReceiptFinalizeState({
    items,
    receiptId,
    savedRows,
    sessionSavedQuantity,
    isFinalizing,
    finalizedOnce,
    purchaseOrderStatus,
  }), [
    items,
    receiptId,
    savedRows,
    sessionSavedQuantity,
    isFinalizing,
    finalizedOnce,
    purchaseOrderStatus,
  ]);

  const finalize = useCallback(async () => {
    if (!finalizeState.canFinalize) {
      return {
        finalized: false,
        reason: 'FINALIZE_NOT_ALLOWED',
        state: finalizeState,
      };
    }
    if (typeof finalizeReceipt !== 'function') {
      throw new TypeError('finalizeReceipt must be a function');
    }

    setIsFinalizing(true);
    setFinalizeError(null);
    try {
      const receipt = await finalizeReceipt(receiptId);
      setFinalizedReceipt(receipt || null);
      setFinalizedOnce(true);
      onFinalized?.(receipt || null);
      return {
        finalized: true,
        receipt: receipt || null,
        legacyPurchaseOrderStatus: finalizeState.legacyPurchaseOrderStatus,
      };
    } catch (error) {
      setFinalizeError(projectPurchaseReceiptError(error, 'ปิดการรับสินค้าไม่สำเร็จ'));
      throw error;
    } finally {
      setIsFinalizing(false);
    }
  }, [finalizeReceipt, finalizeState, onFinalized, receiptId]);

  const resetFinalize = useCallback(() => {
    setIsFinalizing(false);
    setFinalizedOnce(false);
    setFinalizeError(null);
    setFinalizedReceipt(null);
  }, []);

  return {
    ...finalizeState,
    isFinalizing,
    finalizedOnce,
    finalizeError,
    finalizedReceipt,
    finalize,
    resetFinalize,
  };
};
