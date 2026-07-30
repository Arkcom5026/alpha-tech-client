import { beforeEach, describe, expect, it, vi } from 'vitest';

const { auditReceiptBarcodesSlice } = vi.hoisted(() => ({
  auditReceiptBarcodesSlice: vi.fn(),
}));

vi.mock('../audit', () => ({
  auditReceiptBarcodes: auditReceiptBarcodesSlice,
}));

import { auditReceiptBarcodes } from './barcodeApi';

describe('barcodeApi audit runtime cutover', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates the legacy signature and returns the original source response', async () => {
    const sourceResponse = {
      receiptId: 42,
      summary: { total: 3, valid: 3 },
      details: [{ barcode: 'BC-001' }],
    };

    auditReceiptBarcodesSlice.mockResolvedValue({
      receiptId: 42,
      sourceResponse,
      command: { receiptId: 42, includeDetails: true },
    });

    await expect(auditReceiptBarcodes(42)).resolves.toBe(sourceResponse);
    expect(auditReceiptBarcodesSlice).toHaveBeenCalledTimes(1);
    expect(auditReceiptBarcodesSlice).toHaveBeenCalledWith(42, {});
  });

  it('preserves the includeDetails option when delegating', async () => {
    const sourceResponse = { receiptId: 7, summary: { total: 0 } };

    auditReceiptBarcodesSlice.mockResolvedValue({ sourceResponse });

    await expect(
      auditReceiptBarcodes(7, { includeDetails: false }),
    ).resolves.toBe(sourceResponse);

    expect(auditReceiptBarcodesSlice).toHaveBeenCalledWith(7, {
      includeDetails: false,
    });
  });

  it('preserves backend error propagation', async () => {
    const backendError = Object.assign(new Error('Audit failed'), {
      response: {
        status: 500,
        data: { message: 'Audit failed' },
      },
    });

    auditReceiptBarcodesSlice.mockRejectedValue(backendError);

    await expect(auditReceiptBarcodes(18)).rejects.toBe(backendError);
  });

  it('preserves network error propagation', async () => {
    const networkError = new Error('Network Error');
    auditReceiptBarcodesSlice.mockRejectedValue(networkError);

    await expect(
      auditReceiptBarcodes(19, { includeDetails: true }),
    ).rejects.toBe(networkError);
  });
});
