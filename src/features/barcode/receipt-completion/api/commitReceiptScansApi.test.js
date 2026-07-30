import { beforeEach, describe, expect, it, vi } from 'vitest';

const post = vi.fn();

vi.mock('@/utils/apiClient', () => ({
  default: { post },
}));

import { commitReceiptScansApi } from './commitReceiptScansApi';

describe('commitReceiptScansApi', () => {
  beforeEach(() => {
    post.mockReset();
  });

  it('posts normalized items to the existing commit-scans endpoint', async () => {
    const sourceResponse = { ok: true, committed: [{ barcode: 'BC-001' }] };
    post.mockResolvedValue({ data: sourceResponse });

    const result = await commitReceiptScansApi({
      receiptId: 42,
      items: [{ barcode: 'BC-001', sn: 'SN-001' }],
    });

    expect(post).toHaveBeenCalledWith('/receipts/42/commit-scans', {
      items: [{ barcode: 'BC-001', sn: 'SN-001' }],
    });
    expect(result).toBe(sourceResponse);
  });

  it('propagates transport errors for service-level failure projection', async () => {
    const error = new Error('network down');
    post.mockRejectedValue(error);

    await expect(commitReceiptScansApi({ receiptId: 42, items: [] })).rejects.toBe(error);
  });
});
