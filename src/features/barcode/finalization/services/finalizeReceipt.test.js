import { beforeEach, describe, expect, it, vi } from 'vitest';

const { finalizeReceiptApi } = vi.hoisted(() => ({
  finalizeReceiptApi: vi.fn(),
}));

vi.mock('../api/finalizeReceiptApi', () => ({
  finalizeReceiptApi,
}));

import { finalizeReceipt } from './finalizeReceipt';

describe('finalizeReceipt', () => {
  beforeEach(() => {
    finalizeReceiptApi.mockReset();
  });

  it('returns the source response and command owned by the slice', async () => {
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

  it('propagates backend failures', async () => {
    const error = new Error('backend failed');
    finalizeReceiptApi.mockRejectedValue(error);

    await expect(finalizeReceipt('receipt-1')).rejects.toBe(error);
  });

  it('propagates network failures', async () => {
    const error = new TypeError('Network Error');
    finalizeReceiptApi.mockRejectedValue(error);

    await expect(finalizeReceipt('receipt-1')).rejects.toBe(error);
  });
});
