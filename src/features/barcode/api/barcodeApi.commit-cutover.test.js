import { beforeEach, describe, expect, it, vi } from 'vitest';

const { commitReceiptScans } = vi.hoisted(() => ({
  commitReceiptScans: vi.fn(),
}));

vi.mock('../receipt-completion', () => ({
  commitReceiptScans,
}));

import { commitScans } from './barcodeApi';

describe('barcodeApi commitScans compatibility cutover', () => {
  beforeEach(() => {
    commitReceiptScans.mockReset();
  });

  it('delegates the legacy signature to the receipt-completion slice', async () => {
    commitReceiptScans.mockResolvedValue({
      ok: true,
      committed: [{ barcode: 'BC-001' }],
      errors: [],
      message: 'completed',
      sourceResponse: { ok: true },
      command: { receiptId: 12, items: [{ barcode: 'BC-001', sn: 'SN-001' }] },
    });

    await commitScans(12, [{ barcode: ' BC-001 ', serialNumber: ' SN-001 ' }]);

    expect(commitReceiptScans).toHaveBeenCalledWith(12, [
      { barcode: ' BC-001 ', serialNumber: ' SN-001 ' },
    ]);
  });

  it('preserves the legacy success response contract', async () => {
    commitReceiptScans.mockResolvedValue({
      ok: true,
      committed: [{ barcode: 'BC-001' }],
      errors: [],
      message: 'completed',
      sourceResponse: { internal: true },
      command: { receiptId: 12, items: [] },
    });

    await expect(commitScans(12, [])).resolves.toEqual({
      ok: true,
      committed: [{ barcode: 'BC-001' }],
      errors: [],
      message: 'completed',
    });
  });

  it('preserves the legacy backend failure response contract', async () => {
    commitReceiptScans.mockResolvedValue({
      ok: false,
      committed: [{ barcode: 'BC-001' }],
      errors: [{ barcode: 'BC-002', message: 'duplicate' }],
      message: 'Server error',
      sourceResponse: { ok: false },
      command: { receiptId: 12, items: [] },
    });

    await expect(commitScans(12, [])).resolves.toEqual({
      ok: false,
      committed: [{ barcode: 'BC-001' }],
      errors: [{ barcode: 'BC-002', message: 'duplicate' }],
      message: 'Server error',
    });
  });

  it('preserves the legacy network failure response contract', async () => {
    commitReceiptScans.mockResolvedValue({
      ok: false,
      committed: [],
      errors: [],
      message: 'Network error',
      sourceResponse: undefined,
      command: { receiptId: 12, items: [] },
    });

    await expect(commitScans(12, [])).resolves.toEqual({
      ok: false,
      committed: [],
      errors: [],
      message: 'Network error',
    });
  });
});
