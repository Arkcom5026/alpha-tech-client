import { describe, expect, it, vi } from 'vitest';
import { loadReceiptBarcodes } from './loadReceiptBarcodes';

describe('loadReceiptBarcodes', () => {
  it('queries the detail endpoint with normalized identity and filters', async () => {
    const queryApi = vi.fn().mockResolvedValue({
      barcodes: [{ barcode: 'BC-1' }],
    });

    const result = await loadReceiptBarcodes(
      {
        receiptId: '9',
        options: { kind: 'lot', onlyUnactivated: true },
      },
      { queryApi }
    );

    expect(queryApi).toHaveBeenCalledWith(9, {
      kind: 'LOT',
      onlyUnactivated: 1,
    });
    expect(result.barcodes).toEqual([{ barcode: 'BC-1' }]);
  });

  it('supports array responses while retaining source evidence', async () => {
    const response = [{ barcode: 'BC-2' }];
    const result = await loadReceiptBarcodes(
      { receiptId: 10 },
      { queryApi: vi.fn().mockResolvedValue(response) }
    );

    expect(result).toEqual({
      barcodes: response,
      sourceResponse: response,
    });
  });

  it('throws a workflow-specific error and retains the original cause', async () => {
    const cause = new Error('Request failed with status code 500');

    await expect(
      loadReceiptBarcodes(
        { receiptId: 11 },
        { queryApi: vi.fn().mockRejectedValue(cause) }
      )
    ).rejects.toMatchObject({
      message: 'โหลดบาร์โค้ดของใบรับสินค้าไม่สำเร็จ',
      cause,
    });
  });
});
