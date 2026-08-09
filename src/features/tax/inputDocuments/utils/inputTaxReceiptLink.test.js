import { describe, expect, it } from 'vitest';
import {
  receiptAllocationPrefill,
  receiptIdentity,
  remainingReceiptAmount,
} from './inputTaxReceiptLink';

describe('input tax receipt link utilities', () => {
  it('keeps PO and Quick Receipt identities separate', () => {
    expect(receiptIdentity({ sourceType: 'PO_RECEIPT', sourceId: 1 })).toBe('PO_RECEIPT:1');
    expect(receiptIdentity({ sourceType: 'QUICK_RECEIPT', sourceId: 1 })).toBe('QUICK_RECEIPT:1');
  });

  it('projects remaining allocatable total without going negative', () => {
    expect(remainingReceiptAmount({ receiptAmount: 100, allocatedTotalAmount: 35 })).toBe(65);
    expect(remainingReceiptAmount({ receiptAmount: 100, allocatedTotalAmount: 120 })).toBe(0);
  });

  it('prefills editable allocation fields from server source amounts', () => {
    expect(receiptAllocationPrefill({
      sourceSubtotalAmount: 100,
      sourceVatAmount: 5,
      sourceTotalAmount: 105,
      allocatedSubtotal: 20,
      allocatedVatAmount: 1,
      allocatedTotalAmount: 21,
    })).toEqual({
      allocatedSubtotal: 80,
      allocatedVatAmount: 4,
      allocatedTotalAmount: 84,
    });
  });

  it('uses explicit remaining amounts from the server contract', () => {
    expect(receiptAllocationPrefill({
      remainingSubtotalAmount: 90,
      remainingVatAmount: 6.3,
      remainingTotalAmount: 96.3,
    })).toEqual({
      allocatedSubtotal: 90,
      allocatedVatAmount: 6.3,
      allocatedTotalAmount: 96.3,
    });
  });
});
