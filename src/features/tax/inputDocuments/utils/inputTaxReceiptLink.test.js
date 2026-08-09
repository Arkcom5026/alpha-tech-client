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

  it('splits a VAT-inclusive receipt using the server standard-rate policy', () => {
    expect(receiptAllocationPrefill({
      remainingSubtotalAmount: 23490,
      remainingVatAmount: 0,
      remainingTotalAmount: 23490,
      vatPolicy: {
        treatment: 'STANDARD_RATE',
        ratePercent: 7,
        priceMode: 'INCLUSIVE',
        autoCalculate: true,
      },
    })).toEqual({
      allocatedSubtotal: 21953.27,
      allocatedVatAmount: 1536.73,
      allocatedTotalAmount: 23490,
    });
  });

  it('adds VAT for an explicit VAT-exclusive policy', () => {
    expect(receiptAllocationPrefill({
      remainingSubtotalAmount: 100,
      remainingVatAmount: 0,
      remainingTotalAmount: 107,
      vatPolicy: {
        treatment: 'STANDARD_RATE',
        ratePercent: 7,
        priceMode: 'EXCLUSIVE',
        autoCalculate: true,
      },
    })).toEqual({
      allocatedSubtotal: 100,
      allocatedVatAmount: 7,
      allocatedTotalAmount: 107,
    });
  });

  it.each(['ZERO_RATED', 'EXEMPT', 'NON_VAT'])(
    'keeps VAT at zero for %s treatment',
    (treatment) => {
      expect(receiptAllocationPrefill({
        remainingSubtotalAmount: 100,
        remainingVatAmount: 0,
        remainingTotalAmount: 100,
        vatPolicy: {
          treatment,
          ratePercent: 0,
          priceMode: 'INCLUSIVE',
          autoCalculate: true,
        },
      })).toEqual({
        allocatedSubtotal: 100,
        allocatedVatAmount: 0,
        allocatedTotalAmount: 100,
      });
    },
  );

  it('falls back to source amounts when tax semantics are insufficient', () => {
    expect(receiptAllocationPrefill({
      remainingSubtotalAmount: 250,
      remainingVatAmount: 0,
      remainingTotalAmount: 250,
      vatPolicy: {
        treatment: 'UNKNOWN',
        ratePercent: 0,
        priceMode: 'UNKNOWN',
        autoCalculate: false,
      },
    })).toEqual({
      allocatedSubtotal: 250,
      allocatedVatAmount: 0,
      allocatedTotalAmount: 250,
    });
  });
});
