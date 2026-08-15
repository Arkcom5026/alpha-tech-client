import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const featureRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = join(featureRoot, '..', '..', '..');
const readFeature = (relativePath) => readFileSync(join(featureRoot, relativePath), 'utf8');
const readRepo = (relativePath) => readFileSync(join(repoRoot, relativePath), 'utf8');

describe('purchase order receipt ownership retirement', () => {
  it('retires receipt-owned purchase order cancellation', () => {
    const store = readFeature('store/purchaseOrderReceiptStore.js');
    expect(store).not.toContain('cancelPurchaseOrderAction');
  });

  it('keeps receipt UI coordinated through the purchase order lifecycle boundary', () => {
    const table = readFeature('components/purchaseOrderReceiptTable.jsx');
    expect(table).toContain("@/features/purchaseOrder/lifecycle");
    expect(table).toContain('cancelPurchaseOrder');
    expect(table).toContain('fetchPurchaseOrdersForReceiptAction');
    expect(table).toContain('ConfirmActionDialog');
    expect(table).toContain('intent="destructive"');
    expect(table).not.toContain('window.confirm');
  });

  it('keeps cancellation implementation owned by purchase order', () => {
    const lifecycle = readRepo('src/features/purchaseOrder/lifecycle/index.js');
    expect(lifecycle).toContain('updatePurchaseOrderStatus');
    expect(lifecycle).toContain("status: 'CANCELLED'");
  });

  it('preserves receipt-finalization status coordination separately', () => {
    const store = readFeature('store/purchaseOrderReceiptStore.js');
    expect(store).toContain('updatePurchaseOrderStatusAction');
    expect(store).toContain('updatePurchaseOrderStatus');
  });
});
