import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'vitest';

test('Sales store responsibility audit contract', () => {
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const missionPath = path.join(root, 'docs/missions/sales-store-responsibility-audit.md');
const storePath = path.join(root, 'src/features/sales/store/salesStore.js');
const contractPath = path.join(root, 'src/features/sales/store/contracts/salesStoreResponsibilityAuditContract.js');

const read = (filePath) => fs.readFileSync(filePath, 'utf8');
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

[missionPath, storePath, contractPath].forEach((filePath) => {
  assert(fs.existsSync(filePath), `${filePath} must exist`);
});

const mission = read(missionPath);
const store = read(storePath);
const contract = read(contractPath);

const responsibilityClasses = [
  'CREATE_SESSION',
  'HISTORY_QUERY',
  'PRINTABLE_QUERY',
  'RETURN_AND_COLLECTION',
  'DASHBOARD_OVERVIEW',
  'ONLINE_ORDER_CONVERSION',
  'COMPATIBILITY',
];

responsibilityClasses.forEach((name) => {
  assert(mission.includes(name), `${name} must be documented in the mission`);
  assert(contract.includes(name), `${name} must be represented in the contract`);
});

const classifiedSymbols = [
  'saleItems',
  'customerId',
  'paymentList',
  'cardRef',
  'billDiscount',
  'completionState',
  'confirmSaleOrderAction',
  'resetSaleOrderAction',
  'sales',
  'currentSale',
  'printableSales',
  'returnSaleAction',
  'markSalePaidAction',
  'salesOverviewLoading',
  'fetchSalesDashboardOverviewAction',
  'convertOrderOnlineToSaleAction',
];

classifiedSymbols.forEach((symbol) => {
  assert(store.includes(symbol), `${symbol} must exist in the current Sales Store authority`);
  assert(contract.includes(symbol), `${symbol} must have a classified target owner`);
});

assert(contract.includes('destructiveMigrationAllowed: false'), 'Audit must forbid destructive migration');
assert(contract.includes('legacyDeletionAllowed: false'), 'Audit must forbid legacy deletion');
assert(contract.includes('runtimeEvidenceRequiredForRemoval: true'), 'Removal must require runtime evidence');
assert(contract.includes('compatibilitySurfaceMustRemainAvailable: true'), 'Compatibility surface must remain available');

[
  'saleCreateSessionStore.js',
  'saleHistoryStore.js',
  'printableSaleStore.js',
  'saleReturnStore.js',
  'salesDashboardStore.js',
  'legacySalesStoreAdapter.js',
].forEach((targetOwner) => {
  assert(contract.includes(targetOwner), `${targetOwner} must be represented as a target owner`);
});

assert(
  mission.includes('Runtime PASS and Operational PASS require executable evidence'),
  'Mission must preserve verification gate separation'
);

console.log('Sales store responsibility audit contract: PASS');
});
