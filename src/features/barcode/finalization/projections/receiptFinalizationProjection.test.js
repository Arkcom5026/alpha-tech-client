import { describe, expect, it } from 'vitest';

import {
  projectReceiptFinalizationCommand,
  projectReceiptFinalizationResult,
} from './receiptFinalizationProjection';

describe('receiptFinalizationProjection', () => {
  it('projects the receipt identifier into a command', () => {
    expect(projectReceiptFinalizationCommand('receipt-1')).toEqual({
      receiptId: 'receipt-1',
    });
  });

  it('rejects a missing receipt identifier with the legacy message', () => {
    expect(() => projectReceiptFinalizationCommand()).toThrow('Missing receiptId');
  });

  it('preserves the source response', () => {
    const sourceResponse = { ok: true };

    expect(projectReceiptFinalizationResult(sourceResponse)).toEqual({
      sourceResponse,
    });
  });
});
