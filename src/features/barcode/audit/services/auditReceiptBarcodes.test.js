import { beforeEach, describe, expect, it, vi } from 'vitest';

const { auditReceiptBarcodesApi } = vi.hoisted(() => ({
  auditReceiptBarcodesApi: vi.fn(),
}));

vi.mock('../api/auditReceiptBarcodesApi', () => ({
  auditReceiptBarcodesApi,
}));

import { auditReceiptBarcodes } from './auditReceiptBarcodes';

describe('auditReceiptBarcodes', () => {
  beforeEach(() => {
    auditReceiptBarcodesApi.mockReset();
  });

  it('projects the command and preserves the source response', async () => {
    const sourceResponse = { ok: true, receiptId: 18, missing: [] };
    auditReceiptBarcodesApi.mockResolvedValue(sourceResponse);

    await expect(
      auditReceiptBarcodes(18, { includeDetails: false }),
    ).resolves.toEqual({
      sourceResponse,
      command: {
        receiptId: 18,
        includeDetails: false,
      },
    });

    expect(auditReceiptBarcodesApi).toHaveBeenCalledWith({
      receiptId: 18,
      includeDetails: false,
    });
  });

  it('uses the legacy default for includeDetails', async () => {
    auditReceiptBarcodesApi.mockResolvedValue({ ok: true });

    await auditReceiptBarcodes('RC-21');

    expect(auditReceiptBarcodesApi).toHaveBeenCalledWith({
      receiptId: 'RC-21',
      includeDetails: true,
    });
  });

  it('rejects a missing receipt id before calling the API', async () => {
    await expect(auditReceiptBarcodes()).rejects.toThrow('Missing receiptId');
    expect(auditReceiptBarcodesApi).not.toHaveBeenCalled();
  });

  it('propagates API failures unchanged', async () => {
    const error = new Error('audit failed');
    auditReceiptBarcodesApi.mockRejectedValue(error);

    await expect(auditReceiptBarcodes(18)).rejects.toBe(error);
  });
});
