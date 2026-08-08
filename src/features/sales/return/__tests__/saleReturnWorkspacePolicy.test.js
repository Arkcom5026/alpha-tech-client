import { describe, expect, it } from 'vitest';
import { filterReturnableSales } from '../search/policies/filterReturnableSales';
import {
  buildAvailableReturnItems,
  buildSelectedReturnItems,
  calculateSaleReturnAmounts,
  isFullRefundReturn,
  validateSaleReturnSubmission,
} from '../create/policies/saleReturnCreatePolicy';

describe('sale return workspace policies', () => {
  it('filters returnable sales by code, customer identity and phone', () => {
    const sales = [
      { id: 1, code: 'SALE-001', customer: { name: 'Alice', companyName: 'Acme', phone: '0812345678' } },
      { id: 2, code: 'SALE-002', customer: { name: 'Bob', companyName: 'Beta', phone: '0899999999' } },
    ];

    expect(filterReturnableSales(sales, 'sale-001').map((sale) => sale.id)).toEqual([1]);
    expect(filterReturnableSales(sales, 'acme').map((sale) => sale.id)).toEqual([1]);
    expect(filterReturnableSales(sales, '0899').map((sale) => sale.id)).toEqual([2]);
    expect(filterReturnableSales(sales, '')).toBe(sales);
  });

  it('builds available and selected serialized/simple return items', () => {
    const available = buildAvailableReturnItems({
      serializedItems: [
        { saleItemId: 11, eligibleQuantity: 1, eligibleRefund: 100 },
        { saleItemId: 12, eligibleQuantity: 0, eligibleRefund: 50 },
      ],
      simpleItems: [
        { saleItemSimpleId: 21, eligibleQuantity: 2, eligibleRefund: 200 },
      ],
    });

    expect(available).toHaveLength(2);
    expect(available.map((item) => item.kind)).toEqual(['SERIALIZED', 'SIMPLE']);

    const selected = buildSelectedReturnItems({
      available,
      reason: 'overall',
      lines: {
        'SERIALIZED:11': { selected: true, quantity: 1, refundAmount: '90', reason: '' },
        'SIMPLE:21': { selected: true, quantity: '1', refundAmount: '80', reason: 'line reason' },
      },
    });

    expect(selected).toEqual([
      { kind: 'SERIALIZED', saleItemId: 11, quantity: 1, refundAmount: 90, reason: 'overall' },
      { kind: 'SIMPLE', saleItemSimpleId: 21, quantity: 1, refundAmount: 80, reason: 'line reason' },
    ]);
  });

  it('preserves eligible, refund, channel and deduction math', () => {
    const available = [
      { kind: 'SERIALIZED', id: 11, eligibleQuantity: 1, eligibleRefund: 100 },
      { kind: 'SIMPLE', id: 21, eligibleQuantity: 2, eligibleRefund: 200 },
    ];
    const selectedItems = [
      { kind: 'SERIALIZED', saleItemId: 11, quantity: 1, refundAmount: 90, reason: 'x' },
      { kind: 'SIMPLE', saleItemSimpleId: 21, quantity: 1, refundAmount: 80, reason: 'x' },
    ];

    expect(calculateSaleReturnAmounts({
      available,
      selectedItems,
      refunds: [{ amount: 100 }, { amount: 70 }],
    })).toEqual({
      eligibleTotal: 200,
      refundTotal: 170,
      channelTotal: 170,
      deduction: 30,
    });
  });

  it('preserves submission guards and full-refund threshold', () => {
    expect(validateSaleReturnSubmission({ selectedItems: [] })).toBe('กรุณาเลือกรายการคืน');
    expect(validateSaleReturnSubmission({
      selectedItems: [{ reason: 'x' }],
      refundTotal: 100,
      channelTotal: 90,
    })).toBe('ยอดช่องทางคืนเงินต้องเท่ากับยอดคืนจริง');
    expect(validateSaleReturnSubmission({
      selectedItems: [{ reason: '' }],
      refundTotal: 90,
      channelTotal: 90,
      deduction: 10,
      reason: '',
    })).toBe('กรุณาระบุเหตุผลเมื่อคืนเงินไม่เต็มจำนวน');
    expect(validateSaleReturnSubmission({
      selectedItems: [{ reason: 'line reason' }],
      refundTotal: 90,
      channelTotal: 90,
      deduction: 10,
      reason: '',
    })).toBe('');

    expect(isFullRefundReturn({ eligibleTotal: 100, refundTotal: 100, saleTotal: 100, deduction: 0 })).toBe(true);
    expect(isFullRefundReturn({ eligibleTotal: 100, refundTotal: 99, saleTotal: 100, deduction: 1 })).toBe(false);
  });
});
