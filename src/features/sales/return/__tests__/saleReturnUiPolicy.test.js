import { describe, expect, it } from 'vitest';
import { validateSaleReturnDraft } from '../policies/saleReturnUiPolicy';

const base = {
  availableItems: [{
    identity: 'SERIALIZED:1',
    kind: 'SERIALIZED',
    productName: 'Router',
    eligibleQuantity: 1,
  }],
  lineState: {
    'SERIALIZED:1': { selected: true, refundAmount: 900, reason: '' },
  },
  projection: {
    selectedItems: [{ reason: '', refundAmount: 900 }],
    eligibleRefundTotal: 990,
    actualRefundTotal: 900,
    refundEvidenceTotal: 900,
    deductedAmount: 90,
  },
  reason: '',
  refunds: [{ method: 'CASH', amount: 900, sourcePaymentItemId: '' }],
  paymentItems: [],
};

describe('sale return UI policy', () => {
  it('requires free-text reason for a deducted refund', () => {
    expect(validateSaleReturnDraft(base)).toContain('เหตุผล');
  });

  it('accepts a deducted refund with free-text reason', () => {
    expect(validateSaleReturnDraft({ ...base, reason: 'ลูกค้าซื้อผิดรุ่น' })).toBe('');
  });

  it('rejects refund evidence above source remaining amount', () => {
    expect(validateSaleReturnDraft({
      ...base,
      reason: 'ลูกค้าซื้อผิดรุ่น',
      refunds: [{ method: 'CASH', amount: 900, sourcePaymentItemId: '7' }],
      paymentItems: [{ paymentItemId: 7, remainingRefundableAmount: 800 }],
    })).toContain('ยอดคงเหลือ');
  });
});
