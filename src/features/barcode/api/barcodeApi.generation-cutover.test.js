import { beforeEach, describe, expect, it, vi } from 'vitest';

const generateReceiptBarcodesMock = vi.fn();

vi.mock('../generation', () => ({
  generateReceiptBarcodes: generateReceiptBarcodesMock,
}));

vi.mock('@/utils/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

const { generateMissingBarcodes } = await import('./barcodeApi');

describe('legacy barcode generation runtime boundary', () => {
  beforeEach(() => {
    generateReceiptBarcodesMock.mockReset();
  });

  it('delegates receipt identity and options to the generation slice', async () => {
    const sourceResponse = { barcodes: [{ barcode: 'BC-1' }], generated: 1 };
    generateReceiptBarcodesMock.mockResolvedValue({ sourceResponse, barcodes: [] });

    const result = await generateMissingBarcodes('42', {
      dryRun: true,
      lotLabelPerLot: 3,
    });

    expect(generateReceiptBarcodesMock).toHaveBeenCalledWith({
      receiptId: '42',
      options: { dryRun: true, lotLabelPerLot: 3 },
    });
    expect(result).toBe(sourceResponse);
  });

  it('falls back to the legacy barcodes response shape', async () => {
    const barcodes = [{ barcode: 'BC-2' }];
    generateReceiptBarcodesMock.mockResolvedValue({ barcodes });

    await expect(generateMissingBarcodes(7)).resolves.toEqual({ barcodes });
  });

  it('preserves service failures for the store recovery boundary', async () => {
    const error = new Error('generation failed');
    generateReceiptBarcodesMock.mockRejectedValue(error);

    await expect(generateMissingBarcodes(7)).rejects.toBe(error);
  });
});
