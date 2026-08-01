import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'vitest';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

test('Sales store responsibility audit contract', () => {
  const store = read('src/features/sales/store/salesStore.js');
  const contract = read(
    'src/features/sales/store/contracts/salesStoreResponsibilityAuditContract.js'
  );

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
    assert(store.includes(symbol), `${symbol} must remain in the root Sales Store`);
    assert(contract.includes(symbol), `${symbol} must remain classified`);
  });

  const retiredSymbols = [
    'salesOverviewLoading',
    'salesOverviewError',
    'salesOverviewLastLoadedAt',
    'clearSalesOverviewErrorAction',
    'fetchSalesDashboardOverviewAction',
    'sales:',
    'currentSale:',
    'loadSalesAction',
    'setCurrentSale:',
    'setCurrentSaleAction',
    'getSaleByIdAction',
    'printableSales:',
    'loadPrintableSalesAction',
    'markSalePaidAction',
    'updateSaleDocumentLinesAction',
    'normalizePrintableRows',
    'normalizeSaleDetail',
  ];

  retiredSymbols.forEach((symbol) => {
    assert(!store.includes(symbol), `${symbol} must not remain in the root Sales Store`);
    assert(contract.includes(symbol), `${symbol} must be recorded as retired`);
  });

  [
    'getAllSales',
    'getSaleById',
    'markSaleAsPaid',
    'searchPrintableSales',
    'updateSaleDocumentLines',
  ].forEach((apiImport) => {
    assert(!store.includes(apiImport), `${apiImport} must not remain imported by the root store`);
  });

  [
    'saleDashboardRuntimeCapability.js',
    'saleHistoryQueryRuntimeCapability.js',
    'salePrintableRuntimeCapability.js',
    'saleSettlementRuntimeCapability.js',
    'saleDocumentRuntimeSlice.js',
  ].forEach((owner) => {
    assert(contract.includes(owner), `${owner} must be recorded as the certified owner`);
  });

  assert(
    contract.includes('destructiveMigrationAllowed: false'),
    'Audit must still forbid destructive migration'
  );
  assert(
    contract.includes('retirementRequiresCertifiedOwner: true'),
    'Retirement must require a certified owner'
  );
  assert(
    contract.includes('retirementRequiresConsumerAudit: true'),
    'Retirement must require consumer evidence'
  );
  assert(
    contract.includes('duplicateRuntimeAuthorityAllowed: false'),
    'Duplicate runtime authority must remain forbidden'
  );
});
