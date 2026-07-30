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
  const items = Array.isArray(purchaseOrder?.items) ? purchaseOrder.items : [];

  const draft = usePurchaseReceiptDraft({
    purchaseOrderId,
    getReceipt: api?.getReceipt,
  });

  const itemWorkflow = usePurchaseReceiptItems({
    purchaseOrderId,
    receiptId: draft.receiptId,
    receiptHeader,
    items,
    createReceipt: api?.createReceipt,
    addReceiptItem: api?.addReceiptItem,
    onReceiptResolved: draft.rememberReceipt,
    onRecoverableFailure: draft.rememberFailure,
  });

  const finalize = usePurchaseReceiptFinalize({
    items,
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
    rows: itemWorkflow.rows,
    isBusy: draft.isResuming || itemWorkflow.isSavingAny || finalize.isFinalizing,
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
    itemWorkflow.rows,
    itemWorkflow.isSavingAny,
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
      updateRow: itemWorkflow.updateDraft,
      saveRow: itemWorkflow.saveItem,
      finalize: finalize.finalize,
      reset: () => {
        draft.resetDraft();
        itemWorkflow.resetItems();
        finalize.resetFinalize();
      },
    },
  };
};
