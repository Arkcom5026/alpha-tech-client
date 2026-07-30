import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as api from '../api/barcodePrintApi';
import {
  loadReceiptBarcodesForPrint,
  markReceiptBarcodesPrinted,
  searchReceiptsForReprint,
} from './barcodePrintService';

vi.mock('../api/barcodePrintApi', () => ({
  fetchReceiptBarcodesForPrintApi: vi.fn(),
  markReceiptBarcodesPrintedApi: vi.fn(),
  reprintReceiptBarcodesApi: vi.fn(),
  searchReceiptsForReprintApi: vi.fn(),
}));

describe('barcode print service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('validates receipt identity before transport', async () => {
    await expect(loadReceiptBarcodesForPrint('invalid')).rejects.toThrow('receiptId ไม่ถูกต้อง');
    expect(api.fetchReceiptBarcodesForPrintApi).not.toHaveBeenCalled();
  });

  it('loads projected barcode rows and retains source response', async () => {
    const response = { barcodes: [{ barcode: 'BC-001', kind: 'SN' }] };
    api.fetchReceiptBarcodesForPrintApi.mockResolvedValue(response);

    const result = await loadReceiptBarcodesForPrint('12');
    expect(api.fetchReceiptBarcodesForPrintApi).toHaveBeenCalledWith(12, {});
    expect(result.rows[0].barcode).toBe('BC-001');
    expect(result.sourceResponse).toBe(response);
  });

  it('does not call search transport when no search criteria exists', async () => {
    const result = await searchReceiptsForReprint({});
    expect(result.receipts).toEqual([]);
    expect(api.searchReceiptsForReprintApi).not.toHaveBeenCalled();
  });

  it('marks receipt barcodes as printed with normalized identity', async () => {
    const response = { ok: true };
    api.markReceiptBarcodesPrintedApi.mockResolvedValue(response);

    const result = await markReceiptBarcodesPrinted('25');
    expect(api.markReceiptBarcodesPrintedApi).toHaveBeenCalledWith(25);
    expect(result.sourceResponse).toBe(response);
  });
});
