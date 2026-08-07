import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('customer receipt print workspace cutover contract', () => {
  const page = read('src/features/customerReceipt/pages/PrintCustomerReceiptPage.jsx');
  const toolbar = read('src/features/customerReceipt/print/workspace/components/CustomerReceiptPrintToolbar.jsx');
  const state = read('src/features/customerReceipt/print/workspace/components/CustomerReceiptPrintState.jsx');
  const shell = read('src/features/customerReceipt/print/workspace/components/CustomerReceiptPrintShell.jsx');
  const presentation = `${toolbar}\n${state}\n${shell}`;

  it('composes print presentation from workspace owners', () => {
    expect(page).toContain('CustomerReceiptPrintToolbar');
    expect(page).toContain('CustomerReceiptPrintState');
    expect(page).toContain('CustomerReceiptPrintShell');
    expect(page).toContain('onChangeMode={setPrintMode}');
    expect(page).toContain('printRootRef={printRootRef}');
  });

  it('keeps browser and print lifecycle authority in the page', () => {
    expect(page).toContain('useCustomerReceiptStore');
    expect(page).toContain('useSearchParams');
    expect(page).toContain('new ResizeObserver(updatePrintHeight)');
    expect(page).toContain("window.addEventListener('beforeprint', updatePrintHeight)");
    expect(page).toContain('window.print?.()');
    expect(page).toContain('const timer = window.setTimeout(handlePrint, 300)');
  });

  it('keeps workspace presentation free of browser and store authority', () => {
    expect(presentation).not.toContain('useCustomerReceiptStore');
    expect(presentation).not.toContain('useSearchParams');
    expect(presentation).not.toContain('useNavigate');
    expect(presentation).not.toContain('window.');
    expect(presentation).not.toContain('document.');
    expect(presentation).not.toContain('ResizeObserver');
    expect(presentation).not.toContain('loadCustomerReceiptForPrintAction');
  });

  it('preserves state, toolbar intents, and print shell through props', () => {
    expect(page).toContain('detailLoading={detailLoading}');
    expect(page).toContain('printLoading={printLoading}');
    expect(page).toContain('error={error}');
    expect(page).toContain('onBack={handleBack}');
    expect(page).toContain('onPrint={handlePrint}');
    expect(page).toContain('receipt={selectedItem}');
    expect(page).toContain('printMode={printMode}');
  });
});
