import { useMemo } from 'react';

import { usePurchaseReceiptDraft } from './usePurchaseReceiptDraft';
import { usePurchaseReceiptFinalize } from './usePurchaseReceiptFinalize';
import { usePurchaseReceiptItems } from './usePurchaseReceiptItems';

export const usePurchaseReceiptPage = ({
  purchaseOrder,
  receiptHeader,
  api,
} = {}) => {
  const purchaseOrderId = Number(purchaseOrder?.id) || null;
  const sourceItems = Array.isArray(purchaseOrder?.items) ? purchaseOrder.items : [];

  const draft = usePurchaseReceiptDraft({
    purchaseOrderId,
    getReceipt: api?.getReceipt,
  });

  const itemWorkflow = usePurchaseReceiptItems({
    purchaseOrderId,
    receiptId: draft.receiptId,
    receiptHeader,
    createReceipt: api?.createReceipt,
    addReceiptItem: api?.addReceiptItem,
    onReceiptResolved: (receiptId, createdReceipt) => {
      draft.rememberReceipt(createdReceipt || receiptId);
    },
    onSaveFailure: draft.rememberSaveFailure,
  });

  const rows = useMemo(() => sourceItems.map((item) => ({
    item,
    draft: itemWorkflow.draftRows[item?.id] || {},
    state: itemWorkflow.projectRow(item),
    isSaving: itemWorkflow.savingRowId === item?.id,
    isSaved: Boolean(itemWorkflow.savedRows[item?.id]),
    error: itemWorkflow.rowErrors[item?.id] || null,
  })), [
    sourceItems,
    itemWorkflow.draftRows,
    itemWorkflow.projectRow,
    itemWorkflow.rowErrors,
    itemWorkflow.savedRows,
    itemWorkflow.savingRowId,
  ]);

  const finalize = usePurchaseReceiptFinalize({
    items: sourceItems,
    receiptId: draft.receiptId,
    savedRows: itemWorkflow.savedRows,
    sessionSavedQuantity: itemWorkflow.sessionSavedQuantity,
    purchaseOrderStatus: purchaseOrder?.status,
    finalizeReceipt: api?.finalizeReceipt,
  });

  const viewModel = useMemo(() => ({
    purchaseOrderId,
    purchaseOrder,
    receiptId: draft.receiptId,
    receipt: draft.receipt,
    rows,
    isBusy: draft.isResuming || itemWorkflow.isSaving || finalize.isFinalizing,
    resumeError: draft.resumeError,
    finalizeError: finalize.finalizeError,
    canFinalize: finalize.canFinalize,
    allRowsConfirmed: finalize.allRowsConfirmed,
    allItemsComplete: finalize.allItemsComplete,
    legacyPurchaseOrderStatus: finalize.legacyPurchaseOrderStatus,
  }), [
    purchaseOrderId,
    purchaseOrder,
    draft.receiptId,
    draft.receipt,
    draft.isResuming,
    draft.resumeError,
    rows,
    itemWorkflow.isSaving,
    finalize.isFinalizing,
    finalize.finalizeError,
    finalize.canFinalize,
    finalize.allRowsConfirmed,
    finalize.allItemsComplete,
    finalize.legacyPurchaseOrderStatus,
  ]);

  return {
    viewModel,
    draft,
    items: itemWorkflow,
    finalize,
    actions: {
      resume: draft.resume,
      updateRow: itemWorkflow.setRowDraft,
      saveRow: itemWorkflow.saveRow,
      finalize: finalize.finalize,
      reset: () => {
        draft.resetDraft();
        itemWorkflow.resetItems();
        finalize.resetFinalize();
      },
    },
  };
};
