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

  it('hands the generated delivery to the standard Delivery Note print lifecycle', () => {
    const path = buildGeneratedDeliveryPrintPath('advancetech', 91);
    expect(path).toBe(
      '/advancetech/pos/sales/delivery-note/print/91?sourceType=CONSOLIDATED_DELIVERY&sourceId=91',
    );
    expect(path).not.toContain('/combined-billing/delivery/print/');
  });
});
