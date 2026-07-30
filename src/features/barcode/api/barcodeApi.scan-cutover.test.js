import { beforeEach, describe, expect, it, vi } from 'vitest';

const receiveScannedStockItemMock = vi.fn();

vi.mock('@/features/stockItem/receive', () => ({
  receiveScannedStockItem: receiveScannedStockItemMock,
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

vi.mock('../scan-listing', () => ({
  listReceiptsReadyToScan: vi.fn(),
  listReceiptsReadyToScanSn: vi.fn(),
}));

vi.mock('../serial', () => ({
  updateBarcodeSerialNumber: vi.fn(),
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

const { receiveStockItem } = await import('./barcodeApi');

describe('legacy receive stock compatibility boundary', () => {
  beforeEach(() => {
    receiveScannedStockItemMock.mockReset();
  });

  it('delegates the legacy string signature without changing arguments', async () => {
    const sourceResponse = { stockItem: { id: 1 } };
    receiveScannedStockItemMock.mockResolvedValue({ sourceResponse });

    const result = await receiveStockItem(' BC-001 ', ' SN-001 ');

    expect(receiveScannedStockItemMock).toHaveBeenCalledWith(' BC-001 ', ' SN-001 ');
    expect(result).toBe(sourceResponse);
  });

  it('delegates object and nested barcode input to the StockItem public boundary', async () => {
    const input = {
      barcode: {
        barcode: 'BC-002',
        serialNumber: 'SN-002',
        keepSN: true,
      },
    };
    const sourceResponse = { stockItem: { id: 2 } };
    receiveScannedStockItemMock.mockResolvedValue({ sourceResponse });

    await expect(receiveStockItem(input)).resolves.toBe(sourceResponse);
    expect(receiveScannedStockItemMock).toHaveBeenCalledWith(input, undefined);
  });

  it('falls back to the projected stock item when source response is unavailable', async () => {
    const stockItem = { id: 3, serialNumber: null };
    receiveScannedStockItemMock.mockResolvedValue({ stockItem });

    await expect(receiveStockItem({ barcode: 'BC-003' })).resolves.toBe(stockItem);
  });

  it('preserves receive failures for the store recovery boundary', async () => {
    const error = new Error('receive failed');
    receiveScannedStockItemMock.mockRejectedValue(error);

    await expect(receiveStockItem('BC-004')).rejects.toBe(error);
  });
});
