import { describe, expect, it, vi } from 'vitest';
import { listReceiptsWithBarcodes } from './listReceiptsWithBarcodes';

describe('listReceiptsWithBarcodes', () => {
  it('delegates normalized filters and returns projected receipts', async () => {
    const receipts = [{ id: 10 }];
    const listApi = vi.fn().mockResolvedValue({ data: receipts });

    const result = await listReceiptsWithBarcodes(
      { printed: true, limit: 250 },
      { listApi }
    );

    expect(listApi).toHaveBeenCalledWith({ printed: true, limit: 100 });
    expect(result).toEqual({
      params: { printed: true, limit: 100 },
      receipts,
      sourceResponse: { data: receipts },
    });
  });

  it('preserves a direct backend array as source authority', async () => {
    const response = [{ id: 20 }];
    const listApi = vi.fn().mockResolvedValue(response);

    const result = await listReceiptsWithBarcodes({}, { listApi });

    expect(result.receipts).toBe(response);
    expect(result.sourceResponse).toBe(response);
  });

  it('preserves api failures for the compatibility boundary', async () => {
    const error = new Error('receipt listing failed');
    const listApi = vi.fn().mockRejectedValue(error);

    await expect(listReceiptsWithBarcodes({}, { listApi })).rejects.toBe(error);
  });
});
