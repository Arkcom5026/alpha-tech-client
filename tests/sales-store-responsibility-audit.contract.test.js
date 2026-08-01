import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'vitest';
import { SALES_STORE_RESPONSIBILITY_AUDIT_CONTRACT } from '../src/features/sales/store/contracts/salesStoreResponsibilityAuditContract';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('Sales store responsibility audit contract', () => {
  const store = read('src/features/sales/store/salesStore.js');
  const contract = SALES_STORE_RESPONSIBILITY_AUDIT_CONTRACT;

  const retainedSymbols = [
    'saleItems',
    'customerId',
    'paymentList',
    'cardRef',
    'billDiscount',
    'completionState',
    'confirmSaleOrderAction',
    'resetSaleOrderAction',
    'returnSaleAction',
    'convertOrderOnlineToSaleAction',
  ];

  retainedSymbols.forEach((symbol) => {
    expect(store, `${symbol} must remain in the root Sales Store`).toContain(symbol);
    expect(contract.retainedResponsibilitySymbols).toContain(symbol);
  });

  const retiredSymbols = [
    'salesOverviewLoading',
    'salesOverviewError',
    'salesOverviewLastLoadedAt',
    'clearSalesOverviewErrorAction',
    'fetchSalesDashboardOverviewAction',
    'sales',
    'currentSale',
    'loadSalesAction',
    'setCurrentSale',
    'setCurrentSaleAction',
    'getSaleByIdAction',
    'printableSales',
    'loadPrintableSalesAction',
    'markSalePaidAction',
    'updateSaleDocumentLinesAction',
    'normalizePrintableRows',
    'normalizeSaleDetail',
  ];

  retiredSymbols.forEach((symbol) => {
    const sourceToken = ['sales', 'currentSale', 'printableSales'].includes(symbol)
      ? `${symbol}:`
      : symbol;

    expect(store, `${symbol} must not remain in the root Sales Store`).not.toContain(
      sourceToken
    );
    expect(contract.retiredResponsibilitySymbols).toContain(symbol);
  });

  [
    'getAllSales',
    'getSaleById',
    'markSaleAsPaid',
    'searchPrintableSales',
    'updateSaleDocumentLines',
  ].forEach((apiImport) => {
    expect(store, `${apiImport} must not remain imported by the root store`).not.toContain(
      apiImport
    );
  });

  expect(contract.certifiedOwners).toEqual(
    expect.objectContaining({
      DASHBOARD_OVERVIEW:
        'src/features/sales/history/store/saleDashboardRuntimeCapability.js',
      HISTORY_QUERY:
        'src/features/sales/history/store/saleHistoryQueryRuntimeCapability.js',
      PRINTABLE_QUERY:
        'src/features/sales/history/store/salePrintableRuntimeCapability.js',
      SETTLEMENT:
        'src/features/sales/history/store/saleSettlementRuntimeCapability.js',
      DOCUMENT_LINE:
        'src/features/sales/documents/store/saleDocumentRuntimeSlice.js',
    })
  );

  expect(contract.safetyRules).toEqual(
    expect.objectContaining({
      destructiveMigrationAllowed: false,
      retirementRequiresCertifiedOwner: true,
      retirementRequiresConsumerAudit: true,
      duplicateRuntimeAuthorityAllowed: false,
    })
  );
});
