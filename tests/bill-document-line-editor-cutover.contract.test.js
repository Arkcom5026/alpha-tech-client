import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const shortPage = read('src/features/bill/pages/PrintBillPageShortTax.jsx');
const shortRuntime = read('src/features/bill/shortTax/print/workspace/runtime/useBillShortTaxPrintRuntime.js');
const shortShell = read('src/features/bill/shortTax/print/workspace/components/BillShortTaxPrintShell.jsx');
const fullPage = read('src/features/bill/pages/PrintBillPageFullTax.jsx');
const billDocumentSource = read('src/features/bill/hooks/useBillDocumentSource.js');
const rootStore = read('src/features/sales/store/salesStore.js');
const documentSlice = read('src/features/sales/documents/store/saleDocumentRuntimeSlice.js');
const workspaceIndex = read('src/features/sales/documents/workspace/index.js');

describe('Bill document-line editor atomic cutover contract', () => {
  it('keeps SALE and consolidated Bill editors behind certified workspace boundaries', () => {
    expect(shortPage).toContain("from '@/features/sales/documents/workspace'");
    expect(shortPage).toContain('useSaleDocumentLineEditor');
    expect(fullPage).toContain('useBillDocumentLineEditor');
    expect(fullPage).toContain('executeSaleDocumentLineUpdate');
    expect(fullPage).toContain('executeConsolidatedDocumentLineUpdate');
    expect(shortPage).not.toContain("from '@/features/sales/store/salesStore'");
    expect(fullPage).not.toContain("from '@/features/sales/store/salesStore'");
    expect(shortPage).not.toContain('updateSaleDocumentLinesAction');
    expect(fullPage).not.toContain('updateSaleDocumentLinesAction');
  });

  it('preserves billStore as SALE server hydration authority through shared document source', () => {
    expect(shortPage).toContain('useBillDocumentSource');
    expect(fullPage).toContain('useBillDocumentSource');
    expect(billDocumentSource).toContain('useBillStore()');
    expect(billDocumentSource).toContain('billStore.loadSaleByIdAction(');
    expect(billDocumentSource).toContain('billStore.resetAction()');
    expect(shortPage).toContain('reload: reloadForPrint');
    expect(fullPage).toContain('reload: reloadForPrint');
  });

  it('projects the editor contracts into the existing renderers', () => {
    expect(shortPage).toContain('documentLineEditor={documentLineEditor}');
    expect(shortShell).toContain('editingLineKey={editableDocumentLines ? documentLineEditor?.editingLineKey : null}');
    expect(shortShell).toContain('lineDrafts={editableDocumentLines ? documentLineEditor?.lineDrafts : {}}');
    expect(shortShell).toContain('savingLineKey={editableDocumentLines ? documentLineEditor?.savingLineKey : null}');
    expect(shortShell).toContain('onToggleDocumentLineEdit={editableDocumentLines ? documentLineEditor?.actions?.toggle : undefined}');
    expect(shortShell).toContain('onChangeDocumentLineDraft={editableDocumentLines ? documentLineEditor?.actions?.change : undefined}');
    expect(shortShell).toContain('onSaveDocumentLine={editableDocumentLines ? documentLineEditor?.actions?.save : undefined}');

    expect(fullPage).toContain('editingLineKey={canEditDocumentLines ? documentLineEditor.editingLineKey : null}');
    expect(fullPage).toContain('lineDrafts={canEditDocumentLines ? documentLineEditor.lineDrafts : {}}');
    expect(fullPage).toContain('savingLineKey={canEditDocumentLines ? documentLineEditor.savingLineKey : null}');
    expect(fullPage).toContain('onToggleDocumentLineEdit={canEditDocumentLines ? documentLineEditor.actions.toggle : undefined}');
    expect(fullPage).toContain('onChangeDocumentLineDraft={canEditDocumentLines ? documentLineEditor.actions.change : undefined}');
    expect(fullPage).toContain('onSaveDocumentLine={canEditDocumentLines ? documentLineEditor.actions.save : undefined}');
  });

  it('preserves document-specific renderers and print behavior across workspace ownership', () => {
    expect(shortPage).toContain('BillShortTaxPrintShell');
    expect(shortShell).toContain('BillLayoutShortTax');
    expect(shortRuntime).toContain("'--short-tax-receipt-height'");
    expect(shortRuntime).toContain("window.addEventListener('afterprint'");
    expect(shortRuntime).toContain('printAndReturnToSale');

    expect(fullPage).toContain('FullTaxA4Document');
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
