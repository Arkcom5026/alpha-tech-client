import { describe, expect, it } from 'vitest';
import {
  projectReceiptBarcodeAuditCommand,
  projectReceiptBarcodeAuditResult,
} from './receiptBarcodeAuditProjection';

describe('receiptBarcodeAuditProjection', () => {
  it('projects the default audit command', () => {
    expect(projectReceiptBarcodeAuditCommand(15)).toEqual({
      receiptId: 15,
      includeDetails: true,
    });
  });

  it('normalizes includeDetails to a boolean', () => {
    expect(
      projectReceiptBarcodeAuditCommand('RC-1', { includeDetails: 0 }),
    ).toEqual({
      receiptId: 'RC-1',
      includeDetails: false,
    });
  });

  it('rejects a missing receipt id', () => {
    expect(() => projectReceiptBarcodeAuditCommand()).toThrow('Missing receiptId');
  });

  it('preserves the source response', () => {
    const sourceResponse = { ok: true, missing: [] };

    expect(projectReceiptBarcodeAuditResult(sourceResponse)).toEqual({
      sourceResponse,
    });
  });
});
