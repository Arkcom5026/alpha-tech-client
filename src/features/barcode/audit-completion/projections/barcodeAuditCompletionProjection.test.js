import { describe, expect, it } from 'vitest';
import {
  normalizeReceiptIdentity,
  projectAuditCompletionError,
  projectBarcodeAudit,
  projectReceiptCompletion,
} from './barcodeAuditCompletionProjection';

describe('barcode audit completion projections', () => {
  it('normalizes audit evidence while retaining source response', () => {
    const response = { data: { receiptId: 9, totalBarcodes: 4, printedCount: 3, missingCount: 1, items: [{ barcode: 'A' }] } };
    const result = projectBarcodeAudit(response);
    expect(result).toMatchObject({ receiptId: 9, total: 4, printed: 3, missing: 1 });
    expect(result.details).toHaveLength(1);
    expect(result.sourceResponse).toBe(response);
  });

  it('projects idempotent completion evidence', () => {
    expect(projectReceiptCompletion({ status: 'FINALIZED', idempotent: true })).toMatchObject({
      finalized: true,
      alreadyFinalized: true,
    });
  });

  it('validates receipt identity and hides generic transport text', () => {
    expect(normalizeReceiptIdentity(' 42 ')).toBe('42');
    expect(() => normalizeReceiptIdentity(' ')).toThrow('Missing receiptId');
    expect(projectAuditCompletionError(new Error('Request failed with status code 500'))).toBe('ไม่สามารถตรวจสอบหรือปิดใบรับสินค้าได้');
  });
});
