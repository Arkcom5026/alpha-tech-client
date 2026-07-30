import { useCallback, useState } from 'react';

import { projectPurchaseReceiptError } from '../projections/purchaseReceiptErrorProjection';
import { resumePurchaseReceiptDraft } from '../services/resumePurchaseReceiptDraft';

export const usePurchaseReceiptDraft = ({
  purchaseOrderId,
  initialReceiptId = null,
  getReceipt,
} = {}) => {
  const [receiptId, setReceiptId] = useState(Number(initialReceiptId) || null);
  const [receipt, setReceipt] = useState(null);
  const [isResuming, setIsResuming] = useState(false);
  const [resumeError, setResumeError] = useState(null);

  const rememberReceipt = useCallback((nextReceipt) => {
    const nextId = Number(nextReceipt?.id ?? nextReceipt);
    if (!nextId) return null;

    setReceiptId(nextId);
    if (nextReceipt && typeof nextReceipt === 'object') {
      setReceipt(nextReceipt);
    }
    return nextId;
  }, []);

  const rememberSaveFailure = useCallback((failure) => {
    const preservedId = Number(failure?.receiptId);
    if (preservedId) setReceiptId(preservedId);
    setResumeError(projectPurchaseReceiptError(failure));
    return preservedId || null;
  }, []);

  const resume = useCallback(async ({ previousFailure } = {}) => {
    setIsResuming(true);
    setResumeError(null);

    try {
      const result = await resumePurchaseReceiptDraft({
        purchaseOrderId,
        receiptId,
        previousFailure,
        getReceipt,
      });

      if (result.resumed) {
        setReceiptId(result.receiptId);
        setReceipt(result.receipt);
      }
      return result;
    } catch (error) {
      const preservedId = Number(error?.receiptId);
      if (preservedId) setReceiptId(preservedId);
      setResumeError(projectPurchaseReceiptError(error));
      throw error;
    } finally {
      setIsResuming(false);
    }
  }, [getReceipt, purchaseOrderId, receiptId]);

  const resetDraft = useCallback(() => {
    setReceiptId(null);
    setReceipt(null);
    setResumeError(null);
    setIsResuming(false);
  }, []);

  return {
    receiptId,
    receipt,
    isResuming,
    resumeError,
    rememberReceipt,
    rememberSaveFailure,
    resume,
    resetDraft,
  };
};
