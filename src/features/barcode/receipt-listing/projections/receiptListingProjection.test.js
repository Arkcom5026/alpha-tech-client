import { describe, expect, it } from 'vitest';
import {
  projectReceiptListingParams,
  projectReceiptListingResult,
} from './receiptListingProjection';

describe('receipt listing projection', () => {
  it('projects supported filters and clamps limit', () => {
    expect(projectReceiptListingParams({ printed: false, limit: 500 })).toEqual({
      printed: false,
      limit: 100,
    });

    expect(projectReceiptListingParams({ printed: true, limit: 0 })).toEqual({
      printed: true,
      limit: 1,
    });
  });

  it('uses the legacy default limit for invalid values', () => {
    expect(projectReceiptListingParams({ limit: 'invalid' })).toEqual({ limit: 50 });
    expect(projectReceiptListingParams()).toEqual({});
  });

  it('projects supported receipt response shapes', () => {
    const receipts = [{ id: 1 }];
    expect(projectReceiptListingResult(receipts)).toBe(receipts);
    expect(projectReceiptListingResult({ data: receipts })).toBe(receipts);
    expect(projectReceiptListingResult({ receipts })).toBe(receipts);
    expect(projectReceiptListingResult({})).toEqual([]);
  });
});
