import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('purchase order print workspace transformation cutover contract', () => {
  const page = read('src/features/purchaseOrder/print/pages/PrintPurchaseOrderPage.jsx');
  const shell = read('src/features/purchaseOrder/print/workspace/components/PurchaseOrderPrintShell.jsx');
  const policy = read('src/features/purchaseOrder/print/workspace/policies/purchaseOrderPrintPolicy.js');

  it('cuts branch resolution and purchase-order projection over to the print policy', () => {
    expect(page).toContain('resolvePurchaseOrderBranchId');
    expect(page).toContain('preparePurchaseOrderPrintProjection(po)');
    expect(shell).toContain('formatPurchaseOrderMoney');
    expect(policy).toContain('export const formatPurchaseOrderMoney');
  });

  it('removes duplicated projection implementation from the page', () => {
    expect(page).not.toContain('const items = Array.isArray(po.items) ? po.items : []');
    expect(page).not.toContain('const qty = Number(item?.quantity ?? 0)');
    expect(page).not.toContain('const cost = Number(item?.costPrice ?? 0)');
    expect(page).not.toContain('return sum + qty * cost');
    expect(page).not.toContain('formatPurchaseOrderMoney');
  });

  it('keeps branch loading, purchase-order fetching, and browser authority in the page', () => {
    expect(page).toContain('useBranchStore');
    expect(page).toContain('useAuthStore');
    expect(page).toContain('loadAndSetBranchById');
    expect(page).toContain('getPurchaseOrderById(id)');
    expect(page).toContain('printRef');
    expect(page).toContain('window.print()');
    expect(page).toContain('window.html2pdf');
  });

  it('keeps the policy pure and runtime-independent', () => {
    expect(policy).not.toContain('React');
    expect(policy).not.toContain('useMemo');
    expect(policy).not.toContain('useEffect');
    expect(policy).not.toContain('useBranchStore');
    expect(policy).not.toContain('useAuthStore');
    expect(policy).not.toContain('window.');
    expect(policy).not.toContain('getPurchaseOrderById');
  });
});
