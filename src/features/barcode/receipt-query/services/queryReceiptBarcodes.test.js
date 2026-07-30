import { describe, expect, it, vi } from 'vitest';
import { queryReceiptBarcodes } from './queryReceiptBarcodes';

describe('queryReceiptBarcodes', () => {
  it('calls the query API with projected params', async () => {
    const queryApi = vi.fn().mockResolvedValue({
      receipts: [{ id: 9, receiptCode: 'RC-009' }],
    });

    const result = await queryReceiptBarcodes(
      {
        mode: 'REPRINT',
        codeKeyword: ' RC-009 ',
        supplierKeyword: ' Supplier B ',
      },
      { queryApi }
    );

    expect(queryApi).toHaveBeenCalledWith({
      printed: true,
      q: 'RC-009',
      supplier: 'Supplier B',
      limit: 50,
    });
    expect(result.receipts[0]).toMatchObject({
      id: 9,
      receiptCode: 'RC-009',
    });
    expect(result.params.printed).toBe(true);
  });

  it('propagates the original API error for caller recovery', async () => {
    const error = new Error('Network Error');
    const queryApi = vi.fn().mockRejectedValue(error);

    await expect(
      queryReceiptBarcodes({}, { queryApi })
    ).rejects.toBe(error);
  });
});
