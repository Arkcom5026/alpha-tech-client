import { describe, expect, it, vi } from 'vitest';
import { openCompletedSaleDocument } from '../documents/services/saleDocumentWorkflow';

describe('completed sale document workflow', () => {
  it('closes a reserved popup and navigates in the current tab', () => {
    const close = vi.fn();
    const navigate = vi.fn();
    const result = openCompletedSaleDocument({
      shopSlug: 'shop', saleId: 1, option: 'RECEIPT',
      reservedWindow: { closed: false, close },
      navigate,
    });
    expect(close).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledWith('/shop/pos/sales/print-short/1');
    expect(result.mode).toBe('same-tab');
  });

  it('navigates to the requested completed document in the current tab', () => {
    const navigate = vi.fn();
    const result = openCompletedSaleDocument({
      shopSlug: 'shop', saleId: 1, option: 'TAX_INVOICE',
      navigate,
    });
    expect(navigate).toHaveBeenCalledWith('/shop/pos/sales/print-full/1');
    expect(result.mode).toBe('same-tab');
  });

  it('prevents duplicate document opening', () => {
    const navigate = vi.fn();
    const result = openCompletedSaleDocument({
      shopSlug: 'shop', saleId: 1, option: 'DELIVERY_NOTE',
      lastDocumentKey: '1::DELIVERY_NOTE', navigate,
    });
    expect(result.opened).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
  });
});
