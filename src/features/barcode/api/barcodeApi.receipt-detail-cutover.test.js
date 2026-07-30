import { beforeEach, describe, expect, it, vi } from 'vitest';

const generateReceiptBarcodesMock = vi.fn();
const loadReceiptBarcodesMock = vi.fn();

vi.mock('../generation', () => ({
  generateReceiptBarcodes: generateReceiptBarcodesMock,
}));

vi.mock('../receipt-detail', () => ({
  loadReceiptBarcodes: loadReceiptBarcodesMock,
}));

vi.mock('@/utils/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

const { getBarcodesByReceiptId } = await import('./barcodeApi');

describe('legacy receipt barcode detail runtime boundary', () => {
  beforeEach(() => {
    generateReceiptBarcodesMock.mockReset();
    loadReceiptBarcodesMock.mockReset();
  });

  it('delegates receipt identity and legacy filters to the receipt-detail slice', async () => {
    const sourceResponse = { barcodes: [{ barcode: 'BC-1' }], receiptId: 42 };
    loadReceiptBarcodesMock.mockResolvedValue({ sourceResponse, barcodes: [] });

    const result = await getBarcodesByReceiptId('42', {
      kind: 'sn',
      onlyUnscanned: true,
      onlyUnactivated: false,
      silent: true,
    });

    expect(loadReceiptBarcodesMock).toHaveBeenCalledWith({
      receiptId: '42',
      kind: 'sn',
      onlyUnscanned: true,
      onlyUnactivated: false,
      silent: true,
    });
    expect(result).toBe(sourceResponse);
  });

  it('falls back to the legacy barcodes response shape', async () => {
    const barcodes = [{ barcode: 'BC-2' }];
    loadReceiptBarcodesMock.mockResolvedValue({ barcodes });

    await expect(getBarcodesByReceiptId(7)).resolves.toEqual({ barcodes });
  });

  it('preserves service failures for the store recovery boundary', async () => {
    const error = new Error('receipt detail failed');
    loadReceiptBarcodesMock.mockRejectedValue(error);

    await expect(getBarcodesByReceiptId(7, { kind: 'LOT' })).rejects.toBe(error);
  });
});