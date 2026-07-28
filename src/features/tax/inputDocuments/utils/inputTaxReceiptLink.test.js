import { describe, expect, it } from 'vitest';
import { receiptIdentity, remainingReceiptAmount } from './inputTaxReceiptLink';

describe('input tax receipt link utilities', () => {
  it('keeps PO and Quick Receipt identities separate', () => {
    expect(receiptIdentity({ sourceType: 'PO_RECEIPT', sourceId: 1 })).toBe('PO_RECEIPT:1');
    expect(receiptIdentity({ sourceType: 'QUICK_RECEIPT', sourceId: 1 })).toBe('QUICK_RECEIPT:1');
  });

  it('projects remaining allocatable total without going negative', () => {
    expect(remainingReceiptAmount({ receiptAmount: 100, allocatedTotalAmount: 35 })).toBe(65);
    expect(remainingReceiptAmount({ receiptAmount: 100, allocatedTotalAmount: 120 })).toBe(0);
  });
});
