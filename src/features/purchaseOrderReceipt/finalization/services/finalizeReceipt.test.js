import { beforeEach, describe, expect, it, vi } from 'vitest';

const { finalizeReceiptApi } = vi.hoisted(() => ({ finalizeReceiptApi: vi.fn() }));

vi.mock('../api/finalizeReceiptApi', () => ({ finalizeReceiptApi }));

import { finalizeReceipt } from './finalizeReceipt';

describe('finalizeReceipt', () => {
  beforeEach(() => finalizeReceiptApi.mockReset());

  it('returns the source response and command owned by PurchaseOrderReceipt', async () => {
    const sourceResponse = { ok: true, status: 'FINALIZED' };
    finalizeReceiptApi.mockResolvedValue(sourceResponse);

    await expect(finalizeReceipt('receipt-1')).resolves.toEqual({
      sourceResponse,
      command: { receiptId: 'receipt-1' },
    });
    expect(finalizeReceiptApi).toHaveBeenCalledWith({ receiptId: 'receipt-1' });
  });

  it('rejects a missing receipt identifier before calling the API', async () => {
    await expect(finalizeReceipt()).rejects.toThrow('Missing receiptId');
    expect(finalizeReceiptApi).not.toHaveBeenCalled();
  });

  it('propagates backend and network failures', async () => {
    const error = new TypeError('Network Error');
    finalizeReceiptApi.mockImplementationOnce(async () => {
      throw error;
    });

    let received;
    try {
      await finalizeReceipt('receipt-1');
    } catch (caught) {
      received = caught;
    }

    expect(received).toBe(error);
  });
});