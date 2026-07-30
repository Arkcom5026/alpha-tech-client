import { beforeEach, describe, expect, it, vi } from 'vitest';

const reprintReceiptBarcodesMock = vi.fn();
const markReceiptBarcodesPrintedMock = vi.fn();
const searchReceiptsForReprintMock = vi.fn();

vi.mock('../print-reprint', () => ({
  reprintReceiptBarcodes: reprintReceiptBarcodesMock,
  markReceiptBarcodesPrinted: markReceiptBarcodesPrintedMock,
  searchReceiptsForReprint: searchReceiptsForReprintMock,
}));

vi.mock('../generation', () => ({
  generateReceiptBarcodes: vi.fn(),
}));

vi.mock('../receipt-detail', () => ({
  loadReceiptBarcodes: vi.fn(),
}));

vi.mock('@/utils/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

const {
  markBarcodesAsPrinted,
  reprintBarcodes,
  searchReprintReceipts,
} = await import('./barcodeApi');

describe('legacy barcode print/reprint runtime boundary', () => {
  beforeEach(() => {
    reprintReceiptBarcodesMock.mockReset();
    markReceiptBarcodesPrintedMock.mockReset();
    searchReceiptsForReprintMock.mockReset();
  });

  it('delegates reprint and preserves the legacy response shape', async () => {
    const sourceResponse = { barcodes: [{ barcode: 'BC-1' }] };
    reprintReceiptBarcodesMock.mockResolvedValue({
      sourceResponse,
      rows: [{ barcode: 'BC-1' }],
    });

    await expect(reprintBarcodes('42')).resolves.toBe(sourceResponse);
    expect(reprintReceiptBarcodesMock).toHaveBeenCalledWith('42');
  });

  it('delegates mark-printed with the legacy receipt identity', async () => {
    const sourceResponse = { updated: 3 };
    markReceiptBarcodesPrintedMock.mockResolvedValue({ sourceResponse });

    await expect(markBarcodesAsPrinted(7)).resolves.toBe(sourceResponse);
    expect(markReceiptBarcodesPrintedMock).toHaveBeenCalledWith(7);
  });

  it('delegates normalized reprint search and returns receipt rows', async () => {
    const receipts = [{ id: 9, code: 'RC-9' }];
    searchReceiptsForReprintMock.mockResolvedValue({ receipts });

    await expect(
      searchReprintReceipts({
        mode: 'po',
        query: '  PO-9  ',
        printed: false,
        supplierKeyword: '  ACME  ',
        limit: 200,
      })
    ).resolves.toEqual(receipts);

    expect(searchReceiptsForReprintMock).toHaveBeenCalledWith({
      mode: 'po',
      query: '  PO-9  ',
      printed: false,
      supplierKeyword: '  ACME  ',
      limit: 200,
    });
  });

  it('preserves slice failures for store recovery', async () => {
    const error = new Error('reprint failed');
    reprintReceiptBarcodesMock.mockRejectedValue(error);

    await expect(reprintBarcodes(7)).rejects.toBe(error);
  });
});
