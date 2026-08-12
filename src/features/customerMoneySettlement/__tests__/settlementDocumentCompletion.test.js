import { describe, expect, it } from 'vitest';
import {
  buildGeneratedDeliveryPrintPath,
  getSettlementDocumentCompletion,
} from '../utils/settlementDocumentCompletion';

describe('settlement generated consolidated delivery presentation', () => {
  it('uses automatic document completion when the settlement returns a generated delivery', () => {
    const result = getSettlementDocumentCompletion({
      status: 'ACTIVE',
      generatedDocument: {
        id: 91,
        code: 'CBL-022608-0091',
        status: 'ISSUED',
        generationStatus: 'ACTIVE',
      },
    });
    expect(result.mode).toBe('AUTO_GENERATED');
    expect(result.document.id).toBe(91);
  });

  it('keeps a legacy/manual fallback for historical settlements without generated document authority', () => {
    expect(getSettlementDocumentCompletion({ status: 'ACTIVE' })).toEqual({
      mode: 'MANUAL_FALLBACK',
      document: null,
    });
  });

  it('marks the generated delivery cancelled when either settlement or document is cancelled', () => {
    const result = getSettlementDocumentCompletion({
      status: 'CANCELLED',
      generatedDocument: { id: 91, status: 'CANCELLED', generationStatus: 'CANCELLED' },
    });
    expect(result.mode).toBe('AUTO_CANCELLED');
  });

  it('navigates directly to the generated delivery printable route instead of the selection workspace', () => {
    expect(buildGeneratedDeliveryPrintPath('advancetech', 91)).toBe(
      '/advancetech/pos/sales/combined-billing/delivery/print/91',
    );
  });
});
