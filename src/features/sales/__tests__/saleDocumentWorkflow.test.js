import { describe, expect, it, vi } from 'vitest';
import { openCompletedSaleDocument } from '../documents/services/saleDocumentWorkflow';

describe('completed sale document workflow', () => {
  it('opens the completed document in the current tab', () => {
    const navigate = vi.fn();
    const browser = { open: vi.fn() };
    const result = openCompletedSaleDocument({
      shopSlug: 'shop', saleId: 1, option: 'RECEIPT',
      navigate, browser,
    });
    expect(navigate).toHaveBeenCalledWith('/shop/pos/sales/print-short/1');
    expect(browser.open).not.toHaveBeenCalled();
    expect(result.mode).toBe('same-tab');
  });

  it('prevents duplicate document navigation', () => {
    const navigate = vi.fn();
    const result = openCompletedSaleDocument({
      shopSlug: 'shop', saleId: 1, option: 'DELIVERY_NOTE',
      lastDocumentKey: '1::DELIVERY_NOTE', navigate,
    });
    expect(result.opened).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
  });
});
