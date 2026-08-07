import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  formatPurchaseOrderMoney,
  preparePurchaseOrderPrintProjection,
  projectPurchaseOrderLine,
  resolvePurchaseOrderBranchId,
} from '../src/features/purchaseOrder/print/workspace/policies/purchaseOrderPrintPolicy.js';

const root = process.cwd();
const policySource = fs.readFileSync(
  path.join(root, 'src/features/purchaseOrder/print/workspace/policies/purchaseOrderPrintPolicy.js'),
  'utf8',
);

describe('purchase order print workspace policy contract', () => {
  it('keeps branch resolution and print projection pure and runtime-independent', () => {
    expect(policySource).not.toContain('React');
    expect(policySource).not.toContain('useBranchStore');
    expect(policySource).not.toContain('useAuthStore');
    expect(policySource).not.toContain('window.');
    expect(policySource).not.toContain('document.');
  });

  it('preserves branch source-of-truth priority and rejects invalid ids', () => {
    expect(resolvePurchaseOrderBranchId({ selectedBranchId: 7, branchDetail: { id: 8 }, authBranchId: 9 })).toBe(7);
    expect(resolvePurchaseOrderBranchId({ branchDetail: { id: 8 }, authBranchId: 9 })).toBe(8);
    expect(resolvePurchaseOrderBranchId({ branchDetail: { branchId: 10 }, authBranchId: 9 })).toBe(10);
    expect(resolvePurchaseOrderBranchId({ authBranchId: 9 })).toBe(9);
    expect(resolvePurchaseOrderBranchId({ authBranchId: 0 })).toBeNull();
  });

  it('preserves purchase-order line identity, name, quantity, cost, and line total semantics', () => {
    expect(projectPurchaseOrderLine({ id: 12, quantity: '2', costPrice: '150.5', product: { name: 'Widget' } }, 0)).toEqual({
      id: 12,
      name: 'Widget',
      quantity: 2,
      costPrice: 150.5,
      lineTotal: 301,
    });
    expect(projectPurchaseOrderLine({ productName: 'Fallback', quantity: null, costPrice: undefined }, 4)).toEqual({
      id: 4,
      name: 'Fallback',
      quantity: 0,
      costPrice: 0,
      lineTotal: 0,
    });
  });

  it('preserves item fallback and total projection without mutating source rows', () => {
    const items = [
      { id: 1, quantity: 2, costPrice: 10, productName: 'A' },
      { id: 2, quantity: 3, costPrice: 5, productName: 'B' },
    ];
    const po = { items };
    const result = preparePurchaseOrderPrintProjection(po);

    expect(result.total).toBe(35);
    expect(result.lines).toHaveLength(2);
    expect(items[0]).toEqual({ id: 1, quantity: 2, costPrice: 10, productName: 'A' });
    expect(preparePurchaseOrderPrintProjection({ items: null })).toEqual({ lines: [], total: 0 });
  });

  it('preserves purchase-order money formatting semantics', () => {
    expect(formatPurchaseOrderMoney(1234.5)).toBe(
      Number(1234.5).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    );
    expect(formatPurchaseOrderMoney('not-a-number')).toBe('0.00');
  });
});
