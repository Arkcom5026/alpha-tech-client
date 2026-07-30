import { describe, expect, it, vi } from 'vitest';
import {
  assignBarcodeSerialNumber,
  commitReceiptScans,
  receiveScannedStockItem,
} from './barcodeScanService';

describe('barcode scan service', () => {
  it('projects receive payload before delegating to StockItem receive boundary', async () => {
    const receive = vi.fn().mockResolvedValue({ ok: true });
    await receiveScannedStockItem(
      { barcode: ' BC-01 ', serialNumber: ' SN-01 ', keepSN: true },
      undefined,
      { receiveScannedStockItem: receive }
    );

    expect(receive).toHaveBeenCalledWith({
      barcode: { barcode: 'BC-01', serialNumber: 'SN-01' },
      keepSN: true,
    });
  });

  it('requires a serial number before assignment', async () => {
    await expect(assignBarcodeSerialNumber({ barcode: 'BC-01' }, {
      updateBarcodeSerialNumberApi: vi.fn(),
    })).rejects.toThrow('Missing serialNumber');
  });

  it('commits only valid rows and normalizes success', async () => {
    const api = vi.fn().mockResolvedValue({ ok: true, committed: ['BC-01'] });
    const result = await commitReceiptScans(12, [
      { barcode: ' BC-01 ', sn: ' SN-01 ' },
      { barcode: '' },
    ], { commitReceiptScansApi: api });

    expect(api).toHaveBeenCalledWith({
      receiptId: 12,
      items: [{ barcode: 'BC-01', sn: 'SN-01' }],
    });
    expect(result).toMatchObject({ ok: true, committed: ['BC-01'], errors: [] });
  });

  it('projects backend partial failure responses without losing evidence', async () => {
    const payload = { ok: false, committed: [], errors: [{ barcode: 'BC-01', message: 'invalid' }] };
    const error = { response: { data: payload } };
    const result = await commitReceiptScans(12, [{ barcode: 'BC-01' }], {
      commitReceiptScansApi: vi.fn().mockRejectedValue(error),
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toEqual(payload.errors);
    expect(result.sourceResponse).toBe(payload);
  });
});
