import { describe, expect, it, vi } from 'vitest';

import { savePurchaseReceiptItem } from './savePurchaseReceiptItem';

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
    const addReceiptItem = vi.fn().mockRejectedValue(new Error('item save failed'));

    await expect(savePurchaseReceiptItem({
      purchaseOrderId: 644,
      item: { id: 14, quantity: 1, costPrice: 10 },
      createReceipt,
      addReceiptItem,
    })).rejects.toThrow('item save failed');

    expect(createReceipt).toHaveBeenCalledOnce();
    expect(addReceiptItem).toHaveBeenCalledWith(expect.objectContaining({ purchaseOrderReceiptId: 92 }));
  });
});
