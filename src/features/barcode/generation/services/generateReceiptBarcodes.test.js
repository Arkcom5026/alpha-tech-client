import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../api/generateMissingBarcodesApi', () => ({
  generateMissingBarcodesApi: vi.fn(),
}));

import { generateMissingBarcodesApi } from '../api/generateMissingBarcodesApi';
import { generateReceiptBarcodes } from './generateReceiptBarcodes';

describe('generateReceiptBarcodes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects an invalid receipt id before calling the API', async () => {
    await expect(generateReceiptBarcodes({ receiptId: null })).rejects.toThrow(
      'receiptId ไม่ถูกต้อง'
    );
    expect(generateMissingBarcodesApi).not.toHaveBeenCalled();
  });

  it('calls the generation boundary with normalized input', async () => {
    generateMissingBarcodesApi.mockResolvedValue({
      barcodes: [{ id: 1, barcode: 'BC-001', kind: 'SN' }],
    });

    const result = await generateReceiptBarcodes({
      receiptId: '42',
      options: { dryRun: true, lotLabelPerLot: '2' },
    });

    expect(generateMissingBarcodesApi).toHaveBeenCalledWith(42, {
      dryRun: true,
      lotLabelPerLot: 2,
    });
    expect(result.generatedCount).toBe(1);
    expect(result.barcodes[0].barcode).toBe('BC-001');
  });

  it('preserves API failure authority for the caller', async () => {
    const failure = new Error('Network Error');
    generateMissingBarcodesApi.mockRejectedValue(failure);

    await expect(generateReceiptBarcodes({ receiptId: 42 })).rejects.toBe(failure);
  });
});
