import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'vitest';

test('Sale document search ownership audit contract', () => {
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const missionPath = path.join(root, 'docs/missions/sale-document-search-ownership-audit.md');
const contractPath = path.join(
  root,
  'src/features/sales/documents/search/contracts/saleDocumentSearchOwnershipContract.js'
);
const billListPath = path.join(root, 'src/features/bill/pages/PrintBillListPage.jsx');
const deliveryListPath = path.join(
  root,
  'src/features/deliveryNote/pages/DeliveryNoteListPage.jsx'
);
const legacyStorePath = path.join(root, 'src/features/sales/store/salesStore.js');

const read = (filePath) => fs.readFileSync(filePath, 'utf8');
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

[missionPath, contractPath, billListPath, deliveryListPath, legacyStorePath].forEach(
  (filePath) => assert(fs.existsSync(filePath), `${filePath} must exist`)
);

const mission = read(missionPath);
const contract = read(contractPath);
const billList = read(billListPath);
const deliveryList = read(deliveryListPath);
const legacyStore = read(legacyStorePath);

assert(mission.includes('ONE DOCUMENT SEARCH FOUNDATION'), 'Mission must define one search foundation');
assert(mission.includes('SEPARATE DOCUMENT WORKSPACES'), 'Mission must keep workspaces separate');
assert(mission.includes('SEPARATE DOCUMENT RENDERERS'), 'Mission must keep renderers separate');
assert(mission.includes('ONE SERVER-REVALIDATED SALE AUTHORITY'), 'Mission must preserve server authority');

assert(contract.includes("queryFlag: 'onlyPaid'"), 'Bill policy must preserve paid query');
assert(contract.includes("queryFlag: 'onlyUnpaid'"), 'Delivery Note policy must preserve unpaid query');
assert(contract.includes("selectionAuthority: 'saleId'"), 'Search selection must resolve through saleId');
assert(contract.includes('serverRevalidationRequiredAfterSelection: true'), 'Selected documents must revalidate');
assert(contract.includes('navigationSnapshotMayBeOptimisticOnly: true'), 'Navigation state must not be final authority');
assert(contract.includes('mergeRenderers: false'), 'Renderers must remain separate');
assert(contract.includes('mergeDocumentWorkspaces: false'), 'Workspaces must remain separate');
assert(contract.includes('legacyPrintableDeletionAllowed: false'), 'Audit must forbid legacy deletion');

assert(billList.includes('BILL_DOCUMENT_SEARCH_POLICY'), 'Bill list must select the paid document policy');
assert(deliveryList.includes('DELIVERY_NOTE_SEARCH_POLICY'), 'Delivery Note list must select the unpaid document policy');
assert(!billList.includes("useSalesStore"), 'Bill list must remain cut over from the legacy Sales Store');
assert(!deliveryList.includes("useSalesStore"), 'Delivery Note list must remain cut over from the legacy Sales Store');
assert(legacyStore.includes('printableSales:'), 'Legacy printable rows must remain available');
assert(legacyStore.includes('loadPrintableSalesAction:'), 'Legacy printable action must remain available');

console.log('Sale document search ownership audit contract: PASS');
});
