import { describe, expect, it } from 'vitest';
import {
  buildAvailableReturnItems,
  buildSaleReturnCommand,
  buildSaleReturnProjection,
} from '../builders/saleReturnCommandBuilder';

const eligibility = {
  serializedItems: [{
    saleItemId: 11,
    productName: 'Router',
    eligibleQuantity: 1,
    eligibleRefund: 990,
  }],
  simpleItems: [{
    saleItemSimpleId: 22,
    productName: 'Cable',
    eligibleQuantity: 4,
    eligibleRefund: 400,
  }],
};

describe('sale return command builder', () => {
  it('projects partial SIMPLE quantity from original eligible value', () => {
    const availableItems = buildAvailableReturnItems(eligibility);
    const projection = buildSaleReturnProjection({
      availableItems,
      lineState: {
        'SIMPLE:22': {
          selected: true,
          quantity: 2,
          refundAmount: 150,
          reason: 'อุปกรณ์ไม่ครบ',
        },
      },
      globalReason: '',
      refunds: [{ method: 'CASH', amount: 150 }],
    });
    expect(projection.eligibleRefundTotal).toBe(200);
    expect(projection.actualRefundTotal).toBe(150);
    expect(projection.deductedAmount).toBe(50);
  });

  it('builds only the backend command contract', () => {
    const projection = {
      selectedItems: [{
        kind: 'SERIALIZED',
        saleItemId: 11,
        refundAmount: 900,
        reason: 'ซื้อผิดรุ่น',
        eligibleRefund: 990,
      }],
    };
    expect(buildSaleReturnCommand({
      commandId: 'return-command',
      saleId: '9',
      reason: 'ซื้อผิดรุ่น',
      projection,
      refunds: [{
        method: 'TRANSFER',
        amount: '900',
        sourcePaymentItemId: '44',
        referenceNo: '',
        note: '',
      }],
    })).toEqual({
      commandId: 'return-command',
      saleId: 9,
      reason: 'ซื้อผิดรุ่น',
      items: [{
        kind: 'SERIALIZED',
        saleItemId: 11,
        refundAmount: 900,
        reason: 'ซื้อผิดรุ่น',
      }],
      refunds: [{
        method: 'TRANSFER',
        amount: 900,
        sourcePaymentItemId: 44,
      }],
    });
  });
});
