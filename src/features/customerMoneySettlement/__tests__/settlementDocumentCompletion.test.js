import { describe, expect, it } from 'vitest';
import {
  buildBillHistoryPath,
  buildDeliveryHistoryPath,
  buildGeneratedBillPrintPath,
  buildGeneratedDeliveryPrintPath,
  getSettlementDocumentCompletion,
} from '../utils/settlementDocumentCompletion';

describe('settlement generated document handoff', () => {
  it('uses automatic document completion when the settlement returns a generated document', () => {
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

  it('marks the generated document cancelled when either settlement or document is cancelled', () => {
    const result = getSettlementDocumentCompletion({
      status: 'CANCELLED',
      generatedDocument: { id: 91, status: 'CANCELLED', generationStatus: 'CANCELLED' },
    });
    expect(result.mode).toBe('AUTO_CANCELLED');
  });

  it('hands the generated source to the standard Delivery Note print lifecycle', () => {
    const path = buildGeneratedDeliveryPrintPath('advancetech', 91);
    expect(path).toBe(
      '/advancetech/pos/sales/delivery-note/print/91?sourceType=CONSOLIDATED_DELIVERY&sourceId=91',
    );
    expect(path).not.toContain('/combined-billing/delivery/print/');
  });

  it('hands the same generated source to both standard Bill print formats', () => {
    expect(buildGeneratedBillPrintPath('advancetech', 91, 'short')).toBe(
      '/advancetech/pos/sales/bill/print-short/91?sourceType=CONSOLIDATED_DELIVERY&sourceId=91',
    );
    expect(buildGeneratedBillPrintPath('advancetech', 91, 'full')).toBe(
      '/advancetech/pos/sales/bill/print-full/91?sourceType=CONSOLIDATED_DELIVERY&sourceId=91',
    );
  });

  it('keeps historical access in the existing Delivery Note and Bill history routes', () => {
    expect(buildDeliveryHistoryPath('advancetech')).toBe('/advancetech/pos/sales/delivery-note');
    expect(buildBillHistoryPath('advancetech')).toBe('/advancetech/pos/sales/bill');
  });
});