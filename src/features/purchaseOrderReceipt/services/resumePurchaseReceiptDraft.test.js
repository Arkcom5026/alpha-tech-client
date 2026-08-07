import { describe, expect, it, vi } from 'vitest';

import {
  PurchaseReceiptDraftResumeError,
  resumePurchaseReceiptDraft,
} from './resumePurchaseReceiptDraft';

describe('resumePurchaseReceiptDraft', () => {
  it('returns a no-op contract when no recoverable receipt identity exists', async () => {
    const getReceipt = vi.fn();

    await expect(resumePurchaseReceiptDraft({
      purchaseOrderId: 644,
      getReceipt,
    })).resolves.toEqual({
      resumed: false,
      receiptId: null,
      receipt: null,
      reason: 'NO_RECOVERABLE_RECEIPT_ID',
    });
    expect(getReceipt).not.toHaveBeenCalled();
  });

  it('resumes a known open receipt draft', async () => {
    const getReceipt = vi.fn().mockResolvedValue({ id: 91, purchaseOrderId: 644, statusReceipt: 'PENDING' });

    await expect(resumePurchaseReceiptDraft({
      purchaseOrderId: 644,
      receiptId: 91,
      getReceipt,
    })).resolves.toMatchObject({ resumed: true, receiptId: 91, reason: 'RESUMED_KNOWN_DRAFT' });
    expect(getReceipt).toHaveBeenCalledWith(91);
  });

  it('recovers the receipt identity preserved by an item-save failure', async () => {
    const previousFailure = { stage: 'SAVE_ITEM', receiptId: 92 };
    const getReceipt = vi.fn().mockResolvedValue({
      id: 92,
      purchaseOrder: { id: 644 },
      statusReceipt: 'DRAFT',
    });

    await expect(resumePurchaseReceiptDraft({
      purchaseOrderId: 644,
      previousFailure,
      getReceipt,
    })).resolves.toMatchObject({
      resumed: true,
      receiptId: 92,
      reason: 'RECOVERED_FROM_ITEM_SAVE_FAILURE',
    });
  });

  it('rejects a receipt that belongs to another purchase order', async () => {
    const getReceipt = vi.fn().mockResolvedValue({ id: 93, purchaseOrderId: 999, statusReceipt: 'PENDING' });

    await expect(resumePurchaseReceiptDraft({
      purchaseOrderId: 644,
      receiptId: 93,
      getReceipt,
    })).rejects.toMatchObject({
      name: 'PurchaseReceiptDraftResumeError',
      code: 'RECEIPT_PURCHASE_ORDER_MISMATCH',
      receiptId: 93,
      purchaseOrderId: 644,
    });
  });

  it('rejects completed drafts', async () => {
    const getReceipt = vi.fn().mockResolvedValue({ id: 94, purchaseOrderId: 644, statusReceipt: 'COMPLETED' });

    await expect(resumePurchaseReceiptDraft({
      purchaseOrderId: 644,
      receiptId: 94,
      getReceipt,
    })).rejects.toMatchObject({
      name: 'PurchaseReceiptDraftResumeError',
      code: 'RECEIPT_NOT_RESUMABLE',
      receiptId: 94,
      purchaseOrderId: 644,
    });
  });

  it('preserves receipt lookup failure context', async () => {
    const failure = new Error('network failed');
    const getReceipt = vi.fn().mockRejectedValue(failure);

    await expect(resumePurchaseReceiptDraft({
      purchaseOrderId: 644,
      receiptId: 95,
      getReceipt,
    })).rejects.toMatchObject({
      code: 'RECEIPT_LOOKUP_FAILED',
      receiptId: 95,
      cause: failure,
    });
  });

  it('requires a purchase-order identity before attempting resume', async () => {
    await expect(resumePurchaseReceiptDraft({
      receiptId: 91,
      getReceipt: vi.fn(),
    })).rejects.toBeInstanceOf(PurchaseReceiptDraftResumeError);
  });
});
