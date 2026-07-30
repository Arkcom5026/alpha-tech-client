import { describe, expect, it } from 'vitest';
import {
  projectReceiptBarcodeQueryError,
  projectReceiptBarcodeQueryParams,
  projectReceiptBarcodeQueryResult,
} from './receiptBarcodeQueryProjection';

describe('receiptBarcodeQueryProjection', () => {
  it('projects unprinted query params with bounded limit', () => {
    expect(projectReceiptBarcodeQueryParams({
      mode: 'UNPRINTED',
      codeKeyword: ' RC-001 ',
      supplierId: '12',
      limit: 500,
    })).toEqual({
      printed: false,
      q: 'RC-001',
      supplierId: 12,
      limit: 100,
    });
  });

  it('projects reprint rows and preserves source evidence', () => {
    const source = {
      data: [{
        id: 7,
        receiptCode: 'RC-007',
        supplier: { id: 3, name: 'Supplier A' },
        totalBarcodes: 4,
        printed: true,
      }],
      total: 1,
    };

    const result = projectReceiptBarcodeQueryResult(source);

    expect(result.total).toBe(1);
    expect(result.receipts[0]).toMatchObject({
      id: 7,
      receiptCode: 'RC-007',
      supplierId: 3,
      supplierName: 'Supplier A',
      barcodeCount: 4,
      printed: true,
    });
    expect(result.receipts[0].sourceReceipt).toBe(source.data[0]);
    expect(result.sourceResponse).toBe(source);
  });

  it('uses workflow fallback for generic axios status errors', () => {
    expect(projectReceiptBarcodeQueryError(
      new Error('Request failed with status code 500')
    )).toBe('โหลดรายการใบรับสำหรับบาร์โค้ดไม่สำเร็จ');
  });
});
