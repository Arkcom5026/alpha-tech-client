import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const shortPage = read('src/features/bill/pages/PrintBillPageShortTax.jsx');
const shortRuntime = read('src/features/bill/shortTax/print/workspace/runtime/useBillShortTaxPrintRuntime.js');
const shortShell = read('src/features/bill/shortTax/print/workspace/components/BillShortTaxPrintShell.jsx');
const fullPage = read('src/features/bill/pages/PrintBillPageFullTax.jsx');
const rootStore = read('src/features/sales/store/salesStore.js');
const documentSlice = read('src/features/sales/documents/store/saleDocumentRuntimeSlice.js');
const workspaceIndex = read('src/features/sales/documents/workspace/index.js');

const billPages = [shortPage, fullPage];

describe('Bill document-line editor atomic cutover contract', () => {
  it('cuts both Bill workspaces over to the shared workspace boundary', () => {
    for (const source of billPages) {
      expect(source).toContain("from '@/features/sales/documents/workspace'");
      expect(source).toContain('useSaleDocumentLineEditor');
      expect(source).not.toContain("from '@/features/sales/store/salesStore'");
      expect(source).not.toContain('updateSaleDocumentLinesAction');
    }
  });

  it('preserves billStore as the server hydration and print projection owner', () => {
    for (const source of billPages) {
      expect(source).toContain('useBillStore');
      expect(source).toContain('loadSaleByIdAction');
      expect(source).toContain('resetAction()');
      expect(source).toContain('reload: reloadSaleForPrint');
    }
  });

  it('projects the shared editor contract into the existing renderers', () => {
    expect(shortPage).toContain('documentLineEditor={documentLineEditor}');
    expect(shortShell).toContain('editingLineKey={documentLineEditor.editingLineKey}');
    expect(shortShell).toContain('lineDrafts={documentLineEditor.lineDrafts}');
    expect(shortShell).toContain('savingLineKey={documentLineEditor.savingLineKey}');
    expect(shortShell).toContain('onToggleDocumentLineEdit={documentLineEditor.actions.toggle}');
    expect(shortShell).toContain('onChangeDocumentLineDraft={documentLineEditor.actions.change}');
    expect(shortShell).toContain('onSaveDocumentLine={documentLineEditor.actions.save}');

    expect(fullPage).toContain('editingLineKey={documentLineEditor.editingLineKey}');
    expect(fullPage).toContain('lineDrafts={documentLineEditor.lineDrafts}');
    expect(fullPage).toContain('savingLineKey={documentLineEditor.savingLineKey}');
    expect(fullPage).toContain('onToggleDocumentLineEdit={documentLineEditor.actions.toggle}');
    expect(fullPage).toContain('onChangeDocumentLineDraft={documentLineEditor.actions.change}');
    expect(fullPage).toContain('onSaveDocumentLine={documentLineEditor.actions.save}');
  });

  it('preserves document-specific renderers and print behavior across workspace ownership', () => {
    expect(shortPage).toContain('BillShortTaxPrintShell');
    expect(shortShell).toContain('BillLayoutShortTax');
    expect(shortRuntime).toContain("'--short-tax-receipt-height'");
    expect(shortRuntime).toContain("window.addEventListener('afterprint'");
    expect(shortRuntime).toContain('printAndReturnToSale');

    expect(fullPage).toContain('BillLayoutFullTax');
    expect(fullPage).toContain('window.print?.()');
    expect(fullPage).toContain('autoPrint');
  });

  it('makes afterprint authoritative and forbids immediate return navigation', () => {
    expect(shortRuntime).toContain('const PRINT_RETURN_FALLBACK_MS = 60_000');
    expect(shortRuntime).toContain('fallbackTimerId = window.setTimeout(returnOnce, PRINT_RETURN_FALLBACK_MS)');
    expect(shortRuntime).toContain("window.removeEventListener('afterprint', returnOnce)");
    expect(shortRuntime).not.toContain('window.setTimeout(returnOnce, 0)');
  });

  it('keeps document-line mutation in its certified owner only', () => {
    expect(documentSlice).toContain('updateSaleDocumentLinesAction');
    expect(rootStore).not.toContain('updateSaleDocumentLinesAction');
    expect(workspaceIndex).toContain('useSaleDocumentLineEditor');
  });
});
