import { describe, expect, it } from 'vitest';
import { resolveSaleDocumentRoute } from '../documents/saleDocumentRoute';

describe('sale document route', () => {
  it.each([
    ['RECEIPT', '/shop/pos/sales/print-short/42'],
    ['TAX_INVOICE', '/shop/pos/sales/print-full/42'],
    ['DELIVERY_NOTE', '/shop/pos/sales/delivery-note/print/42'],
  ])('resolves %s', (option, expected) => {
    expect(resolveSaleDocumentRoute({ shopSlug: 'shop', saleId: 42, option })).toBe(expected);
  });

  it('returns null for NONE', () => {
    expect(resolveSaleDocumentRoute({ shopSlug: 'shop', saleId: 42, option: 'NONE' })).toBeNull();
  });
});
