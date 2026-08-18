import { useCallback, useMemo, useState } from 'react';

import { projectPurchaseReceiptError } from '../projections/purchaseReceiptErrorProjection';
import { projectPurchaseReceiptItemState } from '../projections/purchaseReceiptItemProjection';
import { savePurchaseReceiptItem } from '../services/savePurchaseReceiptItem';

const SAVE_ITEM_ERROR_FALLBACK = 'บันทึกรายการรับสินค้าไม่สำเร็จ';

export const usePurchaseReceiptItems = ({
  purchaseOrderId,
  receiptId,
  receiptHeader,
  createReceipt,
  addReceiptItem,
  onReceiptResolved,
  onSaveFailure,
} = {}) => {
  const [draftRows, setDraftRows] = useState({});
  const [savedRows, setSavedRows] = useState({});
  const [sessionSavedQuantity, setSessionSavedQuantity] = useState({});
  const [savingRowId, setSavingRowId] = useState(null);
  const [rowErrors, setRowErrors] = useState({});

  const setRowDraft = useCallback((itemId, patch) => {
    setDraftRows((current) => ({
      ...current,
      [itemId]: { ...(current[itemId] || {}), ...(patch || {}) },
    }));
    setRowErrors((current) => ({ ...current, [itemId]: null }));
  }, []);

  const projectRow = useCallback((item) => {
    const draft = draftRows[item?.id] || {};
    return projectPurchaseReceiptItemState({
      orderedQuantity: item?.quantity,
      previouslyReceivedQuantity: item?.receivedQuantity,
      sessionReceivedQuantity: sessionSavedQuantity[item?.id],
      inputQuantity: draft.quantity,
      unitCost: draft.costPrice ?? item?.costPrice,
    });
  }, [draftRows, sessionSavedQuantity]);

  const saveRow = useCallback(async (item) => {
    const itemId = item?.id;
    const draft = draftRows[itemId] || {};
    setSavingRowId(itemId);
    setRowErrors((current) => ({ ...current, [itemId]: null }));

    try {
      const result = await savePurchaseReceiptItem({
        receiptId,
        purchaseOrderId,
        receiptHeader,
        item: {
          purchaseOrderItemId: itemId,
          quantity: draft.quantity,
          costPrice: draft.costPrice ?? item?.costPrice,
          forceAccept: draft.forceAccept,
        },
        createReceipt,
        addReceiptItem,
      });

      setSavedRows((current) => ({ ...current, [itemId]: true }));
      setSessionSavedQuantity((current) => ({
        ...current,
        [itemId]: Number(current[itemId] || 0) + Number(draft.quantity || 0),
      }));
      setDraftRows((current) => ({ ...current, [itemId]: {} }));
      onReceiptResolved?.(result.receiptId, result.createdReceipt);
      return result;
    } catch (error) {
      const message = projectPurchaseReceiptError(error, SAVE_ITEM_ERROR_FALLBACK);
      setRowErrors((current) => ({ ...current, [itemId]: message }));
      onSaveFailure?.(error);
      throw error;
    } finally {
      setSavingRowId(null);
    }
  }, [
    addReceiptItem,
    createReceipt,
    draftRows,
    onReceiptResolved,
    onSaveFailure,
    purchaseOrderId,
    receiptHeader,
    receiptId,
  ]);

  const resetItems = useCallback(() => {
    setDraftRows({});
    setSavedRows({});
    setSessionSavedQuantity({});
    setSavingRowId(null);
    setRowErrors({});
  }, []);

  return useMemo(() => ({
    draftRows,
    savedRows,
    sessionSavedQuantity,
    savingRowId,
    rowErrors,
    isSaving: savingRowId !== null,
    setRowDraft,
    projectRow,
    saveRow,
    resetItems,
  }), [
    draftRows,
    projectRow,
    resetItems,
    rowErrors,
    saveRow,
    savedRows,
    savingRowId,
    sessionSavedQuantity,
    setRowDraft,
  ]);
};
