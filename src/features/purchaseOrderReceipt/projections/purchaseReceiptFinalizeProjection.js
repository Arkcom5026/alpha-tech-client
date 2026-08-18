const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

export const projectPurchaseReceiptFinalizeState = ({
  items = [],
  receiptId = null,
  savedRows = {},
  sessionSavedQuantity = {},
  isSaving = false,
  isFinalizing = false,
  finalizedOnce = false,
  purchaseOrderStatus = '',
} = {}) => {
  const normalizedStatus = String(purchaseOrderStatus || '').toUpperCase();
  const isPurchaseOrderClosed = ['RECEIVED', 'COMPLETED', 'CANCELLED'].includes(normalizedStatus);
  const list = Array.isArray(items) ? items : [];

  const itemStates = list.map((item) => {
    const id = item?.id;
    const ordered = Math.max(toNumber(item?.quantity), 0);
    const receivedDb = Math.max(toNumber(item?.receivedQuantity), 0);
    const receivedSession = Math.max(toNumber(sessionSavedQuantity?.[id]), 0);
    const totalReceived = receivedDb + receivedSession;
    const isConfirmed = receivedDb > 0 || Boolean(savedRows?.[id]);

    return {
      id,
      ordered,
      receivedDb,
      receivedSession,
      totalReceived,
      remaining: Math.max(ordered - totalReceived, 0),
      isConfirmed,
      isComplete: totalReceived >= ordered,
    };
  });

  const hasReceiptActivity = Boolean(receiptId) ||
    Object.keys(savedRows || {}).length > 0 ||
    itemStates.some((item) => item.receivedDb > 0);
  const allRowsConfirmed = itemStates.length > 0 && itemStates.every((item) => item.isConfirmed);
  const allItemsComplete = itemStates.length > 0 && itemStates.every((item) => item.isComplete);
  const legacyPurchaseOrderStatus = allItemsComplete ? 'RECEIVED' : 'PARTIALLY_RECEIVED';

  return {
    itemStates,
    hasReceiptActivity,
    allRowsConfirmed,
    allItemsComplete,
    legacyPurchaseOrderStatus,
    isPurchaseOrderClosed,
    canFinalize: hasReceiptActivity &&
      allRowsConfirmed &&
      !isSaving &&
      !isFinalizing &&
      !finalizedOnce &&
      !isPurchaseOrderClosed,
  };
};
