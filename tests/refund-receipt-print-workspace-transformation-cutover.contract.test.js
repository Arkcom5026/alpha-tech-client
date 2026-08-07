import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('refund receipt print workspace transformation cutover contract', () => {
  const page = read('src/features/refund/pages/PrintRefundReceiptPage.jsx');
  const policy = read('src/features/refund/print/workspace/policies/refundReceiptPrintPolicy.js');

  it('cuts refund and branch presentation projection over to the print policy', () => {
    expect(page).toContain('prepareRefundReceiptPrintProjection');
    expect(page).toContain('prepareRefundReceiptPrintProjection(saleReturn, branch)');
    expect(page).toContain('formatRefundReceiptMoney');
  });

  it('removes duplicated refund projection implementation from the page', () => {
    expect(page).not.toContain('refundTransaction.reduce');
    expect(page).not.toContain('const remainingAmount = totalRefund - totalAmount - deductedAmount');
    expect(page).not.toContain("const customerName = sale?.customer?.name || '-'");
    expect(page).not.toContain("const saleCode = sale?.code || '-'");
    expect(page).not.toContain("const branchName = branch?.name || '-'");
  });

  it('keeps route, store, employee-branch, and browser authority in the page', () => {
    expect(page).toContain('useParams');
    expect(page).toContain('useSaleReturnStore');
    expect(page).toContain('useEmployeeStore');
    expect(page).toContain('getSaleReturnByIdAction(saleReturnId)');
    expect(page).toContain('window.print()');
  });

  it('keeps the print policy pure and runtime-independent', () => {
    expect(policy).not.toContain('React');
    expect(policy).not.toContain('useEffect');
    expect(policy).not.toContain('useState');
    expect(policy).not.toContain('useSaleReturnStore');
    expect(policy).not.toContain('useEmployeeStore');
    expect(policy).not.toContain('window.');
    expect(policy).not.toContain('getSaleReturnByIdAction');
  });
});
