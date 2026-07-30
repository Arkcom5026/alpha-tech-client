import { beforeEach, describe, expect, it, vi } from 'vitest';

const updateBarcodeSerialNumberMock = vi.fn();

vi.mock('../serial', () => ({
  updateBarcodeSerialNumber: updateBarcodeSerialNumberMock,
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

const { updateSerialNumber } = await import('./barcodeApi');

describe('legacy serial number update runtime boundary', () => {
  beforeEach(() => {
    updateBarcodeSerialNumberMock.mockReset();
  });

  it('delegates the legacy arguments to the serial slice', async () => {
    const sourceResponse = { ok: true, barcode: 'BC-001', serialNumber: 'SN-001' };
    updateBarcodeSerialNumberMock.mockResolvedValue({
      barcode: 'BC-001',
      serialNumber: 'SN-001',
      sourceResponse,
    });

    const result = await updateSerialNumber(' BC-001 ', ' SN-001 ');

    expect(updateBarcodeSerialNumberMock).toHaveBeenCalledWith({
      barcode: ' BC-001 ',
      serialNumber: ' SN-001 ',
    });
    expect(result).toBe(sourceResponse);
  });

  it('preserves an empty serial number used to clear the value', async () => {
    const sourceResponse = { ok: true };
    updateBarcodeSerialNumberMock.mockResolvedValue({
      barcode: 'BC-002',
      serialNumber: '',
      sourceResponse,
    });

    await expect(updateSerialNumber('BC-002', '')).resolves.toBe(sourceResponse);
    expect(updateBarcodeSerialNumberMock).toHaveBeenCalledWith({
      barcode: 'BC-002',
      serialNumber: '',
    });
  });

  it('falls back to the slice result when source response is unavailable', async () => {
    const projectedResult = { barcode: 'BC-003', serialNumber: 'SN-003' };
    updateBarcodeSerialNumberMock.mockResolvedValue(projectedResult);

    await expect(updateSerialNumber('BC-003', 'SN-003')).resolves.toBe(projectedResult);
  });

  it('preserves failures for the legacy recovery boundary', async () => {
    const error = new Error('serial update failed');
    updateBarcodeSerialNumberMock.mockRejectedValue(error);

    await expect(updateSerialNumber('BC-004', 'SN-004')).rejects.toBe(error);
  });
});
