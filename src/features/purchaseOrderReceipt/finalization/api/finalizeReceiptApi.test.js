import { beforeEach, describe, expect, it, vi } from 'vitest';

const { patch } = vi.hoisted(() => ({ patch: vi.fn() }));

vi.mock('@/utils/apiClient', () => ({ default: { patch } }));

import { finalizeReceiptApi } from './finalizeReceiptApi';

describe('finalizeReceiptApi', () => {
  beforeEach(() => patch.mockReset());

  it('finalizes the purchase order receipt through its owned endpoint', async () => {
    const sourceResponse = { ok: true, status: 'FINALIZED' };
    patch.mockResolvedValue({ data: sourceResponse });

    await expect(finalizeReceiptApi({ receiptId: 'receipt-1' })).resolves.toEqual(sourceResponse);
    expect(patch).toHaveBeenCalledWith('/purchase-order-receipts/receipt-1/finalize');
  });

  it('returns undefined when the response has no data', async () => {
    patch.mockResolvedValue({});
    await expect(finalizeReceiptApi({ receiptId: 'receipt-1' })).resolves.toBeUndefined();
  });

  it('propagates API failures', async () => {
    const error = new Error('finalization failed');
    patch.mockImplementationOnce(async () => {
      throw error;
    });

    let received;
    try {
      await finalizeReceiptApi({ receiptId: 'receipt-1' });
    } catch (caught) {
      received = caught;
    }

    expect(received).toBe(error);
  });
});