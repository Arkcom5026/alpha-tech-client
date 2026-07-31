import { describe, expect, it } from 'vitest';
import { projectScanReceiptListingResult } from './scanReceiptListingProjection';

describe('projectScanReceiptListingResult', () => {
  it('preserves an array response', () => {
    const response = [{ id: 1 }];
    expect(projectScanReceiptListingResult(response)).toEqual({
      receipts: response,
      sourceResponse: response,
    });
  });

  it('extracts receipts from supported object response shapes', () => {
    expect(projectScanReceiptListingResult({ data: [{ id: 2 }] }).receipts).toEqual([{ id: 2 }]);
    expect(projectScanReceiptListingResult({ receipts: [{ id: 3 }] }).receipts).toEqual([{ id: 3 }]);
  });

  it('falls back to an empty receipt list for unsupported responses', () => {
    expect(projectScanReceiptListingResult(null).receipts).toEqual([]);
    expect(projectScanReceiptListingResult({ data: null }).receipts).toEqual([]);
  });
});
