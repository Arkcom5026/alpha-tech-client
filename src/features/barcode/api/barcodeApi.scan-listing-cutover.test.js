import { beforeEach, describe, expect, it, vi } from 'vitest';

const listReceiptsReadyToScanMock = vi.fn();
const listReceiptsReadyToScanSnMock = vi.fn();

vi.mock('../scan-listing', () => ({
  listReceiptsReadyToScan: listReceiptsReadyToScanMock,
  listReceiptsReadyToScanSn: listReceiptsReadyToScanSnMock,
}));

vi.mock('../generation', () => ({
  generateReceiptBarcodes: vi.fn(),
}));

vi.mock('../receipt-detail', () => ({
  loadReceiptBarcodes: vi.fn(),
}));

vi.mock('../receipt-listing', () => ({
  listReceiptsWithBarcodes: vi.fn(),
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

const {
  getReceiptsReadyToScan,
  getReceiptsReadyToScanSN,
} = await import('./barcodeApi');

describe('legacy scan listing runtime boundaries', () => {
  beforeEach(() => {
    listReceiptsReadyToScanMock.mockReset();
    listReceiptsReadyToScanSnMock.mockReset();
  });

  it('delegates the SN-ready listing to the scan-listing slice', async () => {
    const sourceResponse = [{ id: 1 }];
    listReceiptsReadyToScanSnMock.mockResolvedValue({
      receipts: sourceResponse,
      sourceResponse,
    });

    await expect(getReceiptsReadyToScanSN()).resolves.toBe(sourceResponse);
    expect(listReceiptsReadyToScanSnMock).toHaveBeenCalledTimes(1);
  });

  it('delegates the combined ready listing to the scan-listing slice', async () => {
    const sourceResponse = { receipts: [{ id: 2 }], total: 1 };
    listReceiptsReadyToScanMock.mockResolvedValue({
      receipts: sourceResponse.receipts,
      sourceResponse,
    });

    await expect(getReceiptsReadyToScan()).resolves.toBe(sourceResponse);
    expect(listReceiptsReadyToScanMock).toHaveBeenCalledTimes(1);
  });

  it('falls back to projected receipt arrays when source responses are unavailable', async () => {
    listReceiptsReadyToScanSnMock.mockResolvedValue({ receipts: [{ id: 3 }] });
    listReceiptsReadyToScanMock.mockResolvedValue({ receipts: [{ id: 4 }] });

    await expect(getReceiptsReadyToScanSN()).resolves.toEqual([{ id: 3 }]);
    await expect(getReceiptsReadyToScan()).resolves.toEqual([{ id: 4 }]);
  });

  it('preserves scan listing failures for the store recovery boundary', async () => {
    const snError = new Error('SN listing failed');
    const allError = new Error('scan listing failed');
    listReceiptsReadyToScanSnMock.mockRejectedValue(snError);
    listReceiptsReadyToScanMock.mockRejectedValue(allError);

    await expect(getReceiptsReadyToScanSN()).rejects.toBe(snError);
    await expect(getReceiptsReadyToScan()).rejects.toBe(allError);
  });
});
