import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('refund receipt print workspace cutover contract', () => {
  const page = read('src/features/refund/pages/PrintRefundReceiptPage.jsx');
  const state = read('src/features/refund/print/workspace/components/RefundReceiptPrintState.jsx');
  const toolbar = read('src/features/refund/print/workspace/components/RefundReceiptPrintToolbar.jsx');
  const shell = read('src/features/refund/print/workspace/components/RefundReceiptPrintShell.jsx');

  it('composes refund receipt presentation from workspace owners', () => {
    expect(page).toContain('RefundReceiptPrintState');
    expect(page).toContain('RefundReceiptPrintToolbar');
    expect(page).toContain('RefundReceiptPrintShell');
    expect(page).toContain('projection={projection}');
  });

  it('keeps route, store, employee-branch, and browser authority in the page', () => {
    expect(page).toContain('useParams');
    expect(page).toContain('useSaleReturnStore');
    expect(page).toContain('useEmployeeStore');
    expect(page).toContain('getSaleReturnByIdAction(saleReturnId)');
    expect(page).toContain('const handlePrint = () => window.print()');
  });

  it('keeps workspace presentation free of runtime authority', () => {
    for (const source of [state, toolbar, shell]) {
      expect(source).not.toContain('useParams');
      expect(source).not.toContain('useSaleReturnStore');
      expect(source).not.toContain('useEmployeeStore');
      expect(source).not.toContain('useEffect');
      expect(source).not.toContain('window.print');
      expect(source).not.toContain('getSaleReturnByIdAction');
    }
  });

  it('preserves loading, print intent, and printable shell through explicit props', () => {
    expect(page).toContain('if (!saleReturn) return <RefundReceiptPrintState />');
    expect(page).toContain('<RefundReceiptPrintToolbar onPrint={handlePrint} />');
    expect(toolbar).toContain('onClick={onPrint}');
    expect(shell).toContain('{toolbar}');
    expect(shell).toContain('ใบรับเงินคืน');
  });
});
