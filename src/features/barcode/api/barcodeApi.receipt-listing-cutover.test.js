import { beforeEach, describe, expect, it, vi } from 'vitest';

const listReceiptsWithBarcodesMock = vi.fn();

vi.mock('../receipt-listing', () => ({
  listReceiptsWithBarcodes: listReceiptsWithBarcodesMock,
}));

vi.mock('../generation', () => ({
  generateReceiptBarcodes: vi.fn(),
}));

vi.mock('../receipt-detail', () => ({
  loadReceiptBarcodes: vi.fn(),
}));

vi.mock('../print-reprint', () => ({
  markReceiptBarcodesPrinted: vi.fn(),
  reprintReceiptBarcodes: vi.fn(),
  searchReceiptsForReprint: vi.fn(),
}));

vi.mock('@/utils/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

const { getReceiptsWithBarcodes } = await import('./barcodeApi');

describe('legacy receipt listing runtime boundary', () => {
  beforeEach(() => {
    listReceiptsWithBarcodesMock.mockReset();
  });

  it('delegates listing filters to the receipt-listing slice', async () => {
    const sourceResponse = [{ id: 1 }];
    listReceiptsWithBarcodesMock.mockResolvedValue({
      receipts: sourceResponse,
      sourceResponse,
      params: { printed: false, limit: 25 },
    });

    const result = await getReceiptsWithBarcodes({ printed: false, limit: 25 });

    expect(listReceiptsWithBarcodesMock).toHaveBeenCalledWith({
      printed: false,
      limit: 25,
    });
    expect(result).toBe(sourceResponse);
  });

  it('falls back to the projected receipts array when source response is unavailable', async () => {
    const receipts = [{ id: 2 }];
    listReceiptsWithBarcodesMock.mockResolvedValue({ receipts });

    await expect(getReceiptsWithBarcodes()).resolves.toEqual(receipts);
  });

  it('preserves object-shaped backend responses for legacy callers', async () => {
    const sourceResponse = { receipts: [{ id: 3 }], total: 1 };
    listReceiptsWithBarcodesMock.mockResolvedValue({
      receipts: sourceResponse.receipts,
      sourceResponse,
    });

    await expect(getReceiptsWithBarcodes({ printed: true })).resolves.toBe(sourceResponse);
  });

  it('preserves listing failures for the store recovery boundary', async () => {
    const error = new Error('listing failed');
    listReceiptsWithBarcodesMock.mockRejectedValue(error);

    await expect(getReceiptsWithBarcodes()).rejects.toBe(error);
  });
});
