import { beforeEach, describe, expect, it, vi } from 'vitest';

const { finalizeReceipt } = vi.hoisted(() => ({
  finalizeReceipt: vi.fn(),
}));

vi.mock('../finalization', () => ({
  finalizeReceipt,
}));

import { finalizeReceiptIfNeeded } from './barcodeApi';

describe('barcodeApi finalize receipt cutover', () => {
  beforeEach(() => {
    finalizeReceipt.mockReset();
  });

  it('delegates to the finalization slice and preserves the legacy response', async () => {
    const sourceResponse = { ok: true, status: 'FINALIZED' };
    finalizeReceipt.mockResolvedValue({
      sourceResponse,
      command: { receiptId: 'receipt-1' },
    });

    await expect(finalizeReceiptIfNeeded('receipt-1')).resolves.toEqual(
      sourceResponse,
    );

    expect(finalizeReceipt).toHaveBeenCalledWith('receipt-1');
  });

  it('preserves an undefined source response', async () => {
    finalizeReceipt.mockResolvedValue({
      sourceResponse: undefined,
      command: { receiptId: 'receipt-1' },
    });

    await expect(finalizeReceiptIfNeeded('receipt-1')).resolves.toBeUndefined();
  });

  it('propagates backend failures', async () => {
    const error = new Error('backend failed');
    finalizeReceipt.mockRejectedValue(error);

    await expect(finalizeReceiptIfNeeded('receipt-1')).rejects.toBe(error);
  });

  it('propagates network failures', async () => {
    const error = new TypeError('Network Error');
    finalizeReceipt.mockRejectedValue(error);

    await expect(finalizeReceiptIfNeeded('receipt-1')).rejects.toBe(error);
  });
});
