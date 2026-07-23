import { describe, expect, it, vi } from 'vitest';
import { openCompletedSaleDocument } from '../documents/services/saleDocumentWorkflow';

describe('completed sale document workflow', () => {
  it('reuses a reserved popup', () => {
    const replace = vi.fn();
    const result = openCompletedSaleDocument({
      shopSlug: 'shop', saleId: 1, option: 'RECEIPT',
      reservedWindow: { closed: false, location: { replace }, focus: vi.fn() },
      navigate: vi.fn(),
    });
    expect(replace).toHaveBeenCalledWith('/shop/pos/sales/print-short/1');
    expect(result.mode).toBe('reserved');
  });

  it('falls back to same tab when popup is blocked', () => {
    const navigate = vi.fn();
    const result = openCompletedSaleDocument({
      shopSlug: 'shop', saleId: 1, option: 'TAX_INVOICE',
      navigate, browser: { open: vi.fn(() => null) },
    });
    expect(navigate).toHaveBeenCalledWith('/shop/pos/sales/print-full/1');
    expect(result.mode).toBe('same-tab');
  });

  it('prevents duplicate document opening', () => {
    const browser = { open: vi.fn() };
    const result = openCompletedSaleDocument({
      shopSlug: 'shop', saleId: 1, option: 'DELIVERY_NOTE',
      lastDocumentKey: '1::DELIVERY_NOTE', navigate: vi.fn(), browser,
    });
    expect(result.opened).toBe(false);
    expect(browser.open).not.toHaveBeenCalled();
  });
});
