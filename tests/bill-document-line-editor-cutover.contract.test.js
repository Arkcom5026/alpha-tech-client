import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const shortPage = read('src/features/bill/pages/PrintBillPageShortTax.jsx');
const fullPage = read('src/features/bill/pages/PrintBillPageFullTax.jsx');
const legacyStore = read('src/features/sales/store/salesStore.js');
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
    for (const source of billPages) {
      expect(source).toContain('editingLineKey={documentLineEditor.editingLineKey}');
      expect(source).toContain('lineDrafts={documentLineEditor.lineDrafts}');
      expect(source).toContain('savingLineKey={documentLineEditor.savingLineKey}');
      expect(source).toContain('onToggleDocumentLineEdit={documentLineEditor.actions.toggle}');
      expect(source).toContain('onChangeDocumentLineDraft={documentLineEditor.actions.change}');
      expect(source).toContain('onSaveDocumentLine={documentLineEditor.actions.save}');
    }
  });

  it('preserves document-specific renderers and print behavior', () => {
    expect(shortPage).toContain('BillLayoutShortTax');
    expect(shortPage).toContain("'--short-tax-receipt-height'");
    expect(shortPage).toContain("window.addEventListener('afterprint'");
    expect(shortPage).toContain('printAndReturnToSale');

    expect(fullPage).toContain('BillLayoutFullTax');
    expect(fullPage).toContain('window.print?.()');
    expect(fullPage).toContain('autoPrint');
  });

  it('keeps the legacy action available only as a compatibility surface', () => {
    expect(legacyStore).toContain('updateSaleDocumentLinesAction');
    expect(workspaceIndex).toContain('useSaleDocumentLineEditor');
  });
});
