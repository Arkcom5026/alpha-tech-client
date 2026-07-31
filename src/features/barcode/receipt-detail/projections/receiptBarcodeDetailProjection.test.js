import { describe, expect, it } from 'vitest';
import {
  projectReceiptBarcodeDetailError,
  projectReceiptBarcodeDetailInput,
  projectReceiptBarcodeDetailResult,
} from './receiptBarcodeDetailProjection';

describe('receiptBarcodeDetailProjection', () => {
  it('normalizes receipt identity and detail filters', () => {
    expect(projectReceiptBarcodeDetailInput({
      receiptId: '12',
      options: { kind: 'sn', onlyUnscanned: true, onlyUnactivated: true },
    })).toEqual({
      receiptId: 12,
      params: { kind: 'SN', onlyUnscanned: 1, onlyUnactivated: 1 },
    });
  });

  it('preserves barcode rows and source response evidence', () => {
    const response = { barcodes: [{ barcode: 'BC-1' }], total: 1 };

    expect(projectReceiptBarcodeDetailResult(response)).toEqual({
      barcodes: response.barcodes,
      sourceResponse: response,
    });
  });

  it('replaces generic transport text with a workflow message', () => {
    const result = projectReceiptBarcodeDetailError(
      new Error('Network Error')
    );

    expect(result.message).toBe('โหลดบาร์โค้ดของใบรับสินค้าไม่สำเร็จ');
  });
});
