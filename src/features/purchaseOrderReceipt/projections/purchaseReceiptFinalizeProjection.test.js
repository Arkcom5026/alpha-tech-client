import { describe, expect, it } from 'vitest';

import { projectPurchaseReceiptFinalizeState } from './purchaseReceiptFinalizeProjection';

describe('projectPurchaseReceiptFinalizeState', () => {
  it('blocks finalization before any receipt activity exists', () => {
    expect(projectPurchaseReceiptFinalizeState({
      items: [{ id: 1, quantity: 1, receivedQuantity: 0 }],
    })).toMatchObject({
      hasReceiptActivity: false,
      allRowsConfirmed: false,
      canFinalize: false,
    });
  });

  it('projects a fully received legacy PO status after every row is confirmed', () => {
    expect(projectPurchaseReceiptFinalizeState({
      receiptId: 91,
      items: [
        { id: 1, quantity: 2, receivedQuantity: 1 },
        { id: 2, quantity: 1, receivedQuantity: 0 },
      ],
      savedRows: { 1: true, 2: true },
      sessionSavedQuantity: { 1: 1, 2: 1 },
    })).toMatchObject({
      hasReceiptActivity: true,
      allRowsConfirmed: true,
      allItemsComplete: true,
      legacyPurchaseOrderStatus: 'RECEIVED',
      canFinalize: true,
    });
  });

  it('projects partial receipt when confirmed rows do not satisfy ordered quantities', () => {
    expect(projectPurchaseReceiptFinalizeState({
      receiptId: 92,
      items: [
        { id: 1, quantity: 5, receivedQuantity: 2 },
        { id: 2, quantity: 1, receivedQuantity: 1 },
      ],
      savedRows: { 1: true },
    })).toMatchObject({
      allRowsConfirmed: true,
      allItemsComplete: false,
      legacyPurchaseOrderStatus: 'PARTIALLY_RECEIVED',
      canFinalize: true,
    });
  });

  it('blocks repeated or concurrent finalization and recognizes completed status', () => {
    expect(projectPurchaseReceiptFinalizeState({
      receiptId: 93,
      items: [{ id: 1, quantity: 1, receivedQuantity: 1 }],
      isFinalizing: true,
    }).canFinalize).toBe(false);

    expect(projectPurchaseReceiptFinalizeState({
      receiptId: 93,
      items: [{ id: 1, quantity: 1, receivedQuantity: 1 }],
      purchaseOrderStatus: 'COMPLETED',
    })).toMatchObject({
      isPurchaseOrderClosed: true,
      canFinalize: false,
    });
  });
});
