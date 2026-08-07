import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('customer receipt print workspace behavior contract', () => {
  const page = read('src/features/customerReceipt/pages/PrintCustomerReceiptPage.jsx');
  const toolbar = read('src/features/customerReceipt/print/workspace/components/CustomerReceiptPrintToolbar.jsx');
  const shell = read('src/features/customerReceipt/print/workspace/components/CustomerReceiptPrintShell.jsx');
  const runtime = `${page}\n${toolbar}\n${shell}`;

  it('preserves query-driven auto-print and print-mode resolution', () => {
    expect(page).toContain("String(searchParams.get('autoPrint') || '').toLowerCase()");
    expect(page).toContain("value === '1' || value === 'true' || value === 'yes'");
    expect(page).toContain("String(searchParams.get('mode') || '').toUpperCase()");
    expect(page).toContain("return value === 'SHORT' ? 'SHORT' : 'FULL'");
    expect(page).toContain('setPrintMode(requestedMode)');
  });

  it('keeps print receipt loading and lifecycle cleanup store-owned', () => {
    expect(page).toContain('loadCustomerReceiptForPrintAction(Number(id)).catch(() => null)');
    expect(page).toContain('clearCustomerReceiptMessagesAction()');
    expect(page).toContain('clearSelectedCustomerReceiptAction()');
    expect(page).toContain('printedRef.current = false');
  });

  it('preserves short-paper height measurement and browser cleanup', () => {
    expect(page).toContain("if (printMode !== 'SHORT') return");
    expect(page).toContain("document.documentElement.style.setProperty(");
    expect(page).toContain("'--customer-receipt-short-height'");
    expect(page).toContain('window.requestAnimationFrame(updatePrintHeight)');
    expect(page).toContain('window.setTimeout(updatePrintHeight, 150)');
    expect(page).toContain('new ResizeObserver(updatePrintHeight)');
    expect(page).toContain("window.addEventListener('beforeprint', updatePrintHeight)");
    expect(page).toContain('resizeObserver?.disconnect()');
    expect(page).toContain("document.documentElement.style.removeProperty('--customer-receipt-short-height')");
  });

  it('preserves dynamic back navigation and fail-soft browser printing', () => {
    expect(page).toContain("const printIndex = currentPath.indexOf('/print')");
    expect(page).toContain("const listIndex = currentPath.indexOf('/customer-receipts')");
    expect(page).toContain('navigate(currentPath.substring(0, printIndex))');
    expect(page).toContain('navigate(-1)');
    expect(page).toContain('window.focus?.()');
    expect(page).toContain('window.print?.()');
  });

  it('preserves guarded one-shot auto-print timing', () => {
    expect(page).toContain('if (!autoPrint) return');
    expect(page).toContain('if (detailLoading || printLoading) return');
    expect(page).toContain('if (error) return');
    expect(page).toContain('if (!selectedItem?.id) return');
    expect(page).toContain('if (Number(selectedItem.id) !== Number(id)) return');
    expect(page).toContain('if (printedRef.current) return');
    expect(page).toContain('printedRef.current = true');
    expect(page).toContain('const timer = window.setTimeout(handlePrint, 300)');
  });

  it('keeps full and short receipt layouts plus print media semantics intact across workspace ownership', () => {
    expect(runtime).toContain("printMode === 'SHORT' ? '80mm auto' : 'A4'");
    expect(runtime).toContain("printMode === 'SHORT' ? '0' : '10mm'");
    expect(runtime).toContain('CustomerReceiptShortPrintLayout receipt={receipt}');
    expect(runtime).toContain('CustomerReceiptPrintLayout receipt={receipt}');
    expect(runtime).toContain("onChangeMode?.('FULL')");
    expect(runtime).toContain("onChangeMode?.('SHORT')");
    expect(page).toContain('onChangeMode={setPrintMode}');
  });
});
