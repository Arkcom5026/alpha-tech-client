import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'vitest';

test('Delivery Note document search cutover contract', () => {
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pagePath = path.join(root, 'src/features/deliveryNote/pages/DeliveryNoteListPage.jsx');
const billPagePath = path.join(root, 'src/features/bill/pages/PrintBillListPage.jsx');
const indexPath = path.join(root, 'src/features/sales/documents/search/index.js');
const policyPath = path.join(root, 'src/features/sales/documents/search/policies/deliveryNoteSearchPolicy.js');
const hookPath = path.join(root, 'src/features/sales/documents/search/hooks/useSaleDocumentSearch.js');
const legacyStorePath = path.join(root, 'src/features/sales/store/salesStore.js');
const routesPath = path.join(root, 'src/routes/partner/salesRoutes.jsx');

const read = (filePath) => fs.readFileSync(filePath, 'utf8');
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

[pagePath, billPagePath, indexPath, policyPath, hookPath, legacyStorePath, routesPath].forEach((filePath) => {
  assert(fs.existsSync(filePath), `${filePath} must exist`);
});

const page = read(pagePath);
const billPage = read(billPagePath);
const index = read(indexPath);
const policy = read(policyPath);
const hook = read(hookPath);
const legacyStore = read(legacyStorePath);
const routes = read(routesPath);

assert(page.includes("from '@/features/sales/documents/search'"), 'Delivery Note list must import document search public boundary');
assert(page.includes('useSaleDocumentSearch'), 'Delivery Note list must consume document search workflow hook');
assert(page.includes('DELIVERY_NOTE_SEARCH_POLICY'), 'Delivery Note list must select Delivery Note policy explicitly');
assert(!page.includes("from '@/features/sales/store/salesStore'"), 'Delivery Note list must not import legacy Sales Store');
assert(!page.includes('printableSales'), 'Delivery Note list must not read legacy printable rows');
assert(!page.includes('loadPrintableSalesAction'), 'Delivery Note list must not call legacy printable action');
assert(page.includes('documentSearch.actions.search'), 'Delivery Note list must search through document search owner');
assert(page.includes("navigate(`print/${row.id}`)"), 'Delivery Note list must preserve nested print route authority');

assert(policy.includes("id: 'DELIVERY_NOTE'"), 'Delivery Note policy identity must remain explicit');
assert(policy.includes('onlyUnpaid: 1'), 'Delivery Note policy must preserve unpaid-only query semantics');
assert(policy.includes('balanceAmount'), 'Delivery Note policy must project outstanding balance');
assert(policy.includes('agingDays'), 'Delivery Note policy must project aging days');

assert(billPage.includes('BILL_DOCUMENT_SEARCH_POLICY'), 'Bill list must retain separate Bill policy');
assert(!billPage.includes('DELIVERY_NOTE_SEARCH_POLICY'), 'Bill list must not consume Delivery Note policy');
assert(!page.includes('BILL_DOCUMENT_SEARCH_POLICY'), 'Delivery Note list must not consume Bill policy');
assert(hook.includes('useSaleDocumentSearchStore'), 'Both consumers must share dedicated document search store');
assert(index.includes('DELIVERY_NOTE_SEARCH_POLICY'), 'Delivery Note policy must be publicly exported');
assert(index.includes('useSaleDocumentSearch'), 'Document search hook must be publicly exported');

assert(legacyStore.includes('printableSales:'), 'Legacy printable state must remain for compatibility');
assert(legacyStore.includes('loadPrintableSalesAction:'), 'Legacy printable action must remain for compatibility');
assert(routes.includes("path: 'delivery-note'"), 'Delivery Note route group must exist');
assert(routes.includes("path: 'print/:saleId'"), 'Delivery Note print route must exist');

console.log('Delivery Note document search cutover contract: PASS');
});
