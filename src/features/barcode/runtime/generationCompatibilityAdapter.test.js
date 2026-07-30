import { describe, expect, it, vi } from 'vitest';
import {
  generateBarcodesForLegacyStore,
  runGenerationForLegacyPrintBatch,
} from './generationCompatibilityAdapter';

describe('generationCompatibilityAdapter', () => {
  it('preserves the legacy barcode list return shape', async () => {
    const generate = vi.fn().mockResolvedValue({
      barcodes: [
        {
          barcode: 'BC-001',
          printed: 0,
          qtyLabelsSuggested: '2',
          sourceBarcode: {
            id: 10,
            barcode: 'BC-001',
            printed: false,
            kind: 'SN',
            stockItem: {
              id: 20,
              serialNumber: 'SN-001',
              status: 'IN_STOCK',
            },
          },
        },
      ],
    });

    const rows = await generateBarcodesForLegacyStore({ receiptId: '15', generate });

    expect(generate).toHaveBeenCalledWith({ receiptId: '15', options: {} });
    expect(rows).toEqual([
      expect.objectContaining({
        id: 10,
        barcode: 'BC-001',
        printed: false,
        kind: 'SN',
        stockItemId: 20,
        serialNumber: 'SN-001',
        stockItemStatus: 'IN_STOCK',
      }),
    ]);
  });

  it('keeps SOLD_OUT compatible with the legacy SOLD state', async () => {
    const generate = vi.fn().mockResolvedValue({
      barcodes: [{ sourceBarcode: { barcode: 'BC-002', status: 'SOLD_OUT' } }],
    });

    const rows = await generateBarcodesForLegacyStore({ receiptId: 16, generate });

    expect(rows[0].stockItemStatus).toBe('SOLD');
  });

  it('returns an empty list when the generation response has no rows', async () => {
    const generate = vi.fn().mockResolvedValue({});

    await expect(
      generateBarcodesForLegacyStore({ receiptId: 17, generate })
    ).resolves.toEqual([]);
  });

  it('preserves the print batch generation phase boolean contract', async () => {
    const generate = vi.fn().mockResolvedValue({ barcodes: [] });

    await expect(
      runGenerationForLegacyPrintBatch({ receiptId: 18, generate })
    ).resolves.toBe(true);
    expect(generate).toHaveBeenCalledWith({ receiptId: 18, options: {} });
  });

  it('does not swallow generation failures', async () => {
    const error = new Error('generation failed');
    const generate = vi.fn().mockRejectedValue(error);

    await expect(
      generateBarcodesForLegacyStore({ receiptId: 19, generate })
    ).rejects.toBe(error);
  });
});
