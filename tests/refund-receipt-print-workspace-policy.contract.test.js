import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  formatRefundReceiptMoney,
  prepareRefundReceiptPrintProjection,
} from '../src/features/refund/print/workspace/policies/refundReceiptPrintPolicy';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('refund receipt print workspace policy contract', () => {
  const policy = read('src/features/refund/print/workspace/policies/refundReceiptPrintPolicy.js');

  it('keeps refund receipt projection pure and runtime-independent', () => {
    expect(policy).not.toContain('React');
    expect(policy).not.toContain('useEffect');
    expect(policy).not.toContain('useSaleReturnStore');
    expect(policy).not.toContain('useEmployeeStore');
    expect(policy).not.toContain('window.');
  });

  it('preserves refund aggregation and remaining-amount semantics', () => {
    const saleReturn = {
      totalRefund: 1000,
      refundedAmount: 500,
      deductedAmount: 100,
      refundTransaction: [
        { id: 1, amount: 200 },
        { id: 2, amount: 300 },
      ],
    };

    const projection = prepareRefundReceiptPrintProjection(saleReturn, null);

    expect(projection.totalAmount).toBe(500);
    expect(projection.remainingAmount).toBe(400);
    expect(projection.refundedAmount).toBe(500);
  });

  it('preserves sale, customer, and refund transaction identity projection', () => {
    const refundTransactions = [{ id: 9, amount: 125, method: 'CASH' }];
    const projection = prepareRefundReceiptPrintProjection({
      code: 'SR-001',
      createdAt: '2026-08-08T00:00:00.000Z',
      sale: {
        code: 'SALE-001',
        customer: { name: 'สมชาย' },
      },
      refundTransaction: refundTransactions,
    }, null);

    expect(projection.code).toBe('SR-001');
    expect(projection.saleCode).toBe('SALE-001');
    expect(projection.customerName).toBe('สมชาย');
    expect(projection.refundTransactions).toBe(refundTransactions);
  });

  it('preserves current branch presentation fallbacks without changing authority', () => {
    const projection = prepareRefundReceiptPrintProjection({}, {
      name: 'Advance Tech',
      address: 'Bangkok',
      phone: '02-000-0000',
      taxId: '0100000000000',
      email: 'store@example.com',
      contactName: 'Admin',
    });

    expect(projection.branch).toEqual({
      name: 'Advance Tech',
      address: 'Bangkok',
      phone: '02-000-0000',
      taxId: '0100000000000',
      email: 'store@example.com',
      contactName: 'Admin',
    });

    expect(prepareRefundReceiptPrintProjection({}, null).branch).toEqual({
      name: '-',
      address: '-',
      phone: '-',
      taxId: '-',
      email: '-',
      contactName: '-',
    });
  });

  it('preserves fixed two-decimal money formatting', () => {
    expect(formatRefundReceiptMoney(1234.5)).toBe('1234.50');
    expect(formatRefundReceiptMoney(null)).toBe('0.00');
  });
});
