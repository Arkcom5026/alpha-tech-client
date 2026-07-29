import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (relativePath) =>
  fs.readFileSync(path.resolve(process.cwd(), relativePath), 'utf8');

const auditedDocumentConsumers = [
  'src/features/bill/pages/PrintBillListPage.jsx',
  'src/features/deliveryNote/pages/DeliveryNoteListPage.jsx',
  'src/features/bill/pages/PrintBillPageFullTax.jsx',
  'src/features/bill/pages/PrintBillPageShortTax.jsx',
  'src/features/deliveryNote/pages/PrintDeliveryNotePage.jsx',
];

describe('remaining legacy document consumer reference audit', () => {
  it('keeps audited document consumers off legacy Sale Store document state/actions', () => {
    for (const file of auditedDocumentConsumers) {
      const source = read(file);

      expect(source).not.toContain("features/sales/store/salesStore");
      expect(source).not.toContain('printableSales');
      expect(source).not.toContain('loadPrintableSalesAction');
      expect(source).not.toContain('updateSaleDocumentLinesAction');
      expect(source).not.toContain('getSaleByIdAction');
    }
  });

  it('retains compatibility declarations until runtime evidence permits deletion', () => {
    const historySlice = read(
      'src/features/sales/history/store/saleHistoryRuntimeSlice.js'
    );
    const documentSlice = read(
      'src/features/sales/documents/store/saleDocumentRuntimeSlice.js'
    );

    expect(historySlice).toContain('currentSale: null');
    expect(historySlice).toContain('printableSales: []');
    expect(historySlice).toContain('getSaleByIdAction');
    expect(historySlice).toContain('loadPrintableSalesAction');
    expect(documentSlice).toContain('updateSaleDocumentLinesAction');
  });

  it('protects the Sale Return workflow from document-scope deletion', () => {
    const returnPage = read('src/features/saleReturn/pages/CreateReturnPage.jsx');

    expect(returnPage).toContain('getSaleByIdAction');
    expect(returnPage).toContain('createSaleReturnAction');
    expect(returnPage).toContain('ReturnForm');
  });

  it('records the repository-level ownership decision and runtime deletion gate', () => {
    const audit = read(
      'docs/audits/remaining-legacy-document-consumer-reference-audit.md'
    );

    expect(audit).toContain(
      'Repository-level document ownership migration is complete'
    );
    expect(audit).toContain('Compatibility removal requires a separate atomic increment');
    expect(audit).toContain('runtime evidence');
  });
});
