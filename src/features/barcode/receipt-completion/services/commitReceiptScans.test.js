import { beforeEach, describe, expect, it, vi } from 'vitest';

const commitReceiptScansApi = vi.fn();

vi.mock('../api/commitReceiptScansApi', () => ({
  commitReceiptScansApi,
}));

import { commitReceiptScans } from './commitReceiptScans';

describe('commitReceiptScans', () => {
  beforeEach(() => {
    commitReceiptScansApi.mockReset();
  });

  it('commits normalized scans and retains source plus command evidence', async () => {
    const sourceResponse = {
      ok: true,
      committed: [{ barcode: 'BC-001' }],
      errors: [],
      message: 'completed',
    };
    commitReceiptScansApi.mockResolvedValue(sourceResponse);

    const result = await commitReceiptScans(12, [
      { barcode: ' BC-001 ', serialNumber: ' SN-001 ' },
      { barcode: '' },
    ]);

    expect(commitReceiptScansApi).toHaveBeenCalledWith({
      receiptId: 12,
      items: [{ barcode: 'BC-001', sn: 'SN-001' }],
    });
    expect(result).toEqual({
      ok: true,
      committed: [{ barcode: 'BC-001' }],
      errors: [],
      message: 'completed',
      sourceResponse,
      command: {
        receiptId: 12,
        items: [{ barcode: 'BC-001', sn: 'SN-001' }],
      },
    });
  });

  it('returns the legacy structured result for backend failures', async () => {
    const sourceResponse = {
      ok: false,
      committed: [{ barcode: 'BC-001' }],
      errors: [{ barcode: 'BC-002', message: 'duplicate' }],
    };
    commitReceiptScansApi.mockRejectedValue({ response: { data: sourceResponse } });

    const result = await commitReceiptScans(12, [{ barcode: 'BC-002' }]);

    expect(result).toMatchObject({
      ok: false,
      committed: [{ barcode: 'BC-001' }],
      errors: [{ barcode: 'BC-002', message: 'duplicate' }],
      message: 'Server error',
      sourceResponse,
    });
  });

  it('returns the legacy network failure result instead of throwing', async () => {
    commitReceiptScansApi.mockRejectedValue(new Error('offline'));

    await expect(commitReceiptScans(12, [])).resolves.toMatchObject({
      ok: false,
      committed: [],
      errors: [],
      message: 'Network error',
    });
  });
});
