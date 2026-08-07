import { describe, expect, it, vi } from 'vitest';

import {
  PurchaseReceiptItemSaveError,
  savePurchaseReceiptItem,
} from './savePurchaseReceiptItem';

describe('savePurchaseReceiptItem', () => {
  it('creates a receipt header before saving the first item', async () => {
    const createReceipt = vi.fn().mockResolvedValue({ id: 91 });
    const addReceiptItem = vi.fn().mockResolvedValue({ id: 301 });

    const result = await savePurchaseReceiptItem({
      purchaseOrderId: 644,
      receiptHeader: { receivedAt: '2026-07-29' },
      item: { id: 12, quantity: 1, costPrice: 490 },
      createReceipt,
      addReceiptItem,
    });

    expect(createReceipt).toHaveBeenCalledWith({
      purchaseOrderId: 644,
      receivedAt: '2026-07-29',
    });
    expect(addReceiptItem).toHaveBeenCalledWith({
      purchaseOrderReceiptId: 91,
      purchaseOrderItemId: 12,
      quantity: 1,
      costPrice: 490,
      forceAccept: false,
    });
    expect(result).toMatchObject({ receiptId: 91, createdReceipt: { id: 91 }, savedItem: { id: 301 } });
  });

  it('reuses an existing receipt and does not create another header', async () => {
    const createReceipt = vi.fn();
    const addReceiptItem = vi.fn().mockResolvedValue({ id: 302 });

    await savePurchaseReceiptItem({
      receiptId: 91,
      purchaseOrderId: 644,
      item: { purchaseOrderItemId: 13, quantity: 2, costPrice: 25 },
      createReceipt,
      addReceiptItem,
    });

    expect(createReceipt).not.toHaveBeenCalled();
    expect(addReceiptItem).toHaveBeenCalledWith(expect.objectContaining({ purchaseOrderReceiptId: 91 }));
  });

  it('preserves the created receipt identity when item saving fails', async () => {
    const createReceipt = vi.fn().mockResolvedValue({ id: 92 });
    const originalError = new Error('item save failed');
    const addReceiptItem = vi.fn().mockRejectedValue(originalError);

    let failure;
    try {
      await savePurchaseReceiptItem({
        purchaseOrderId: 644,
        item: { id: 14, quantity: 1, costPrice: 10 },
        createReceipt,
        addReceiptItem,
      });
    } catch (error) {
      failure = error;
    }

    expect(failure).toBeInstanceOf(PurchaseReceiptItemSaveError);
    expect(failure).toMatchObject({
      message: 'item save failed',
      stage: 'SAVE_ITEM',
      receiptId: 92,
      createdReceipt: { id: 92 },
      cause: originalError,
    });
    expect(createReceipt).toHaveBeenCalledOnce();
    expect(addReceiptItem).toHaveBeenCalledWith(expect.objectContaining({ purchaseOrderReceiptId: 92 }));
  });

  it('identifies header creation failures without inventing a receipt identity', async () => {
    const createReceipt = vi.fn().mockRejectedValue(new Error('header failed'));
    const addReceiptItem = vi.fn();

    await expect(savePurchaseReceiptItem({
      purchaseOrderId: 644,
      item: { id: 15, quantity: 1, costPrice: 10 },
      createReceipt,
      addReceiptItem,
    })).rejects.toMatchObject({
      name: 'PurchaseReceiptItemSaveError',
      stage: 'CREATE_RECEIPT',
      receiptId: null,
      message: 'header failed',
    });

    expect(addReceiptItem).not.toHaveBeenCalled();
  });
});
