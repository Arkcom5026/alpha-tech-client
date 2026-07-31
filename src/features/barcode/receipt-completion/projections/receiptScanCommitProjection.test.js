import { describe, expect, it } from 'vitest';

import {
  projectReceiptScanCommitCommand,
  projectReceiptScanCommitFailure,
  projectReceiptScanCommitResult,
} from './receiptScanCommitProjection';

describe('receiptScanCommitProjection', () => {
  it('normalizes receipt scan items and supports sn plus serialNumber', () => {
    expect(
      projectReceiptScanCommitCommand('RC-1', [
        { barcode: ' BC-001 ', sn: ' SN-001 ' },
        { barcode: 'BC-002', serialNumber: ' SN-002 ' },
        { barcode: 'BC-003' },
      ])
    ).toEqual({
      receiptId: 'RC-1',
      items: [
        { barcode: 'BC-001', sn: 'SN-001' },
        { barcode: 'BC-002', sn: 'SN-002' },
        { barcode: 'BC-003' },
      ],
    });
  });

  it('removes rows without a barcode and defaults non-array input to an empty list', () => {
    expect(projectReceiptScanCommitCommand(7, [{ barcode: '  ', sn: 'SN-X' }, null])).toEqual({
      receiptId: 7,
      items: [],
    });
    expect(projectReceiptScanCommitCommand(7, null)).toEqual({ receiptId: 7, items: [] });
  });

  it('rejects a missing receipt id with the legacy message', () => {
    expect(() => projectReceiptScanCommitCommand(null, [])).toThrow('Missing receiptId');
  });

  it('projects a successful source response with stable array fallbacks', () => {
    const sourceResponse = { ok: 1, committed: null, errors: 'invalid', message: 'done' };

    expect(projectReceiptScanCommitResult(sourceResponse)).toEqual({
      ok: true,
      committed: [],
      errors: [],
      message: 'done',
      sourceResponse,
    });
  });

  it('maps backend failures using the existing server fallback contract', () => {
    const sourceResponse = { ok: false, committed: null, errors: [{ barcode: 'BC-1' }] };

    expect(projectReceiptScanCommitFailure({ response: { data: sourceResponse } })).toEqual({
      ok: false,
      committed: [],
      errors: [{ barcode: 'BC-1' }],
      message: 'Server error',
      sourceResponse,
    });
  });

  it('maps transport failures to the existing network result', () => {
    expect(projectReceiptScanCommitFailure(new Error('offline'))).toEqual({
      ok: false,
      committed: [],
      errors: [],
      message: 'Network error',
      sourceResponse: undefined,
    });
  });
});
