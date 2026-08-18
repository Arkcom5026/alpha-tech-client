import { describe, expect, it } from 'vitest';

import { projectPurchaseReceiptItemState } from './purchaseReceiptItemProjection';

describe('projectPurchaseReceiptItemState', () => {
  it('projects a fresh full receipt line', () => {
    expect(projectPurchaseReceiptItemState({
      orderedQuantity: 2,
      inputQuantity: 2,
      unitCost: 25,
    })).toMatchObject({
      receivedAfterInput: 2,
      remainingAfterInput: 0,
      lineTotal: 50,
      isCompleteAfterInput: true,
      isOverReceive: false,
      canSave: true,
    });
  });

  it('combines database and session quantities without mutating the inputs', () => {
    const result = projectPurchaseReceiptItemState({
      orderedQuantity: 5,
      previouslyReceivedQuantity: 2,
      sessionReceivedQuantity: 1,
      inputQuantity: 1,
      unitCost: 100,
    });

    expect(result.receivedBeforeInput).toBe(3);
    expect(result.receivedAfterInput).toBe(4);
    expect(result.remainingAfterInput).toBe(1);
  });

  it('surfaces over-receive and blocks zero-quantity saves', () => {
    expect(projectPurchaseReceiptItemState({ orderedQuantity: 1, inputQuantity: 2 })).toMatchObject({
      isOverReceive: true,
      remainingAfterInput: 0,
    });
    expect(projectPurchaseReceiptItemState({ orderedQuantity: 1, inputQuantity: 0 }).canSave).toBe(false);
  });
});
