import { beforeEach, describe, expect, it, vi } from 'vitest';

const { get } = vi.hoisted(() => ({
  get: vi.fn(),
}));

vi.mock('@/utils/apiClient', () => ({
  default: { get },
}));

import { auditReceiptBarcodesApi } from './auditReceiptBarcodesApi';

describe('auditReceiptBarcodesApi', () => {
  beforeEach(() => {
    get.mockReset();
  });

  it('requests the receipt audit endpoint with details enabled', async () => {
    const sourceResponse = { ok: true, receiptId: 12 };
    get.mockResolvedValue({ data: sourceResponse });

    await expect(
      auditReceiptBarcodesApi({ receiptId: 12, includeDetails: true }),
    ).resolves.toBe(sourceResponse);

    expect(get).toHaveBeenCalledWith('/barcodes/receipt/12/audit', {
      params: { includeDetails: 1 },
    });
  });

  it('requests the receipt audit endpoint with details disabled', async () => {
    get.mockResolvedValue({ data: { ok: true } });

    await auditReceiptBarcodesApi({ receiptId: 'RC-9', includeDetails: false });

    expect(get).toHaveBeenCalledWith('/barcodes/receipt/RC-9/audit', {
      params: { includeDetails: 0 },
    });
  });

  it('propagates API failures', async () => {
    const error = new Error('audit failed');
    get.mockRejectedValue(error);

    await expect(
      auditReceiptBarcodesApi({ receiptId: 12, includeDetails: true }),
    ).rejects.toBe(error);
  });
});
