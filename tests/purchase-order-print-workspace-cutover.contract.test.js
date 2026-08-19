import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('purchase order print workspace cutover contract', () => {
  const page = read('src/features/purchaseOrder/print/pages/PrintPurchaseOrderPage.jsx');
  const state = read('src/features/purchaseOrder/print/workspace/components/PurchaseOrderPrintState.jsx');
  const toolbar = read('src/features/purchaseOrder/print/workspace/components/PurchaseOrderPrintToolbar.jsx');
  const shell = read('src/features/purchaseOrder/print/workspace/components/PurchaseOrderPrintShell.jsx');

  it('composes print presentation from workspace owners', () => {
    expect(page).toContain('PurchaseOrderPrintState');
    expect(page).toContain('PurchaseOrderPrintToolbar');
    expect(page).toContain('PurchaseOrderPrintShell');
  });

  it('keeps branch, purchase-order, presentation, and browser authority in the page', () => {
    expect(page).toContain('useBranchStore');
    expect(page).toContain('useAuthStore');
    expect(page).toContain('getPurchaseOrderById(id)');
    expect(page).toContain('getPurchaseOrderPresentation(id)');
    expect(page).toContain('loadAndSetBranchById');
    expect(page).toContain('useRef()');
    expect(page).toContain('window.print()');
    expect(page).toContain('window.html2pdf');
  });

  it('keeps workspace presentation free of runtime authority', () => {
    for (const source of [state, toolbar, shell]) {
      expect(source).not.toContain('useBranchStore');
      expect(source).not.toContain('useAuthStore');
      expect(source).not.toContain('getPurchaseOrderById');
      expect(source).not.toContain('getPurchaseOrderPresentation');
      expect(source).not.toContain('useParams');
      expect(source).not.toContain('window.print');
      expect(source).not.toContain('window.html2pdf');
    }
  });

  it('preserves state, toolbar intents, and printable shell through resolved presentation props', () => {
    expect(page).toContain('status="loading"');
    expect(page).toContain('status="missing"');
    expect(page).toContain('onPrint={() => window.print()}');
    expect(page).toContain('onDownloadPdf={handleDownloadPDF}');
    expect(page).toContain('printRef={printRef}');
    expect(page).toContain('headerConfig={headerConfig}');
    expect(page).toContain('po={po}');
    expect(page).toContain('lines={lines}');
    expect(page).toContain('total={total}');
    expect(page).toContain('presentationFooterContent={footerContent}');
    expect(page).toContain('presentationFooterFontSize={footerFontSize}');
  });
});
