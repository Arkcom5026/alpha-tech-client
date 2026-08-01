import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (relativePath) =>
  fs.readFileSync(path.resolve(process.cwd(), relativePath), 'utf8');

describe('Sale root store history authority retirement', () => {
  const rootStore = read('src/features/sales/store/salesStore.js');
  const historySlice = read(
    'src/features/sales/history/store/saleHistoryRuntimeSlice.js'
  );
  const dashboardOwner = read(
    'src/features/sales/history/store/saleDashboardRuntimeCapability.js'
  );
  const queryOwner = read(
    'src/features/sales/history/store/saleHistoryQueryRuntimeCapability.js'
  );
  const printableOwner = read(
    'src/features/sales/history/store/salePrintableRuntimeCapability.js'
  );
  const settlementOwner = read(
    'src/features/sales/history/store/saleSettlementRuntimeCapability.js'
  );
  const documentOwner = read(
    'src/features/sales/documents/store/saleDocumentRuntimeSlice.js'
  );

  it('keeps the root store focused on retained responsibilities', () => {
    expect(rootStore).toContain('confirmSaleOrderAction');
    expect(rootStore).toContain('returnSaleAction');
    expect(rootStore).toContain('convertOrderOnlineToSaleAction');
    expect(rootStore).toContain('executeSaleCompletion');
  });

  it('removes duplicated history, dashboard, printable, settlement, and document authority', () => {
    [
      'fetchSalesDashboardOverviewAction',
      'loadSalesAction',
      'getSaleByIdAction',
      'loadPrintableSalesAction',
      'markSalePaidAction',
      'updateSaleDocumentLinesAction',
      'normalizePrintableRows',
      'normalizeSaleDetail',
    ].forEach((symbol) => {
      expect(rootStore).not.toContain(symbol);
    });

    [
      'getAllSales',
      'getSaleById',
      'markSaleAsPaid',
      'searchPrintableSales',
      'updateSaleDocumentLines',
    ].forEach((apiImport) => {
      expect(rootStore).not.toContain(apiImport);
    });
  });

  it('keeps each certified capability owner composed and executable', () => {
    expect(historySlice).toContain('createSaleDashboardRuntimeCapability');
    expect(historySlice).toContain('createSaleHistoryQueryRuntimeCapability');
    expect(historySlice).toContain('createSalePrintableRuntimeCapability');
    expect(historySlice).toContain('createSaleSettlementRuntimeCapability');

    expect(dashboardOwner).toContain('fetchSalesDashboardOverviewAction');
    expect(queryOwner).toContain('getSaleByIdAction');
    expect(printableOwner).toContain('loadPrintableSalesAction');
    expect(settlementOwner).toContain('markSalePaidAction');
    expect(documentOwner).toContain('updateSaleDocumentLinesAction');
  });
});
