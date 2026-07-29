import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'vitest';

test('Bill document search cutover contract', () => {
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pagePath = path.join(root, 'src/features/bill/pages/PrintBillListPage.jsx');
const indexPath = path.join(root, 'src/features/sales/documents/search/index.js');
const policyPath = path.join(root, 'src/features/sales/documents/search/policies/billDocumentSearchPolicy.js');
const hookPath = path.join(root, 'src/features/sales/documents/search/hooks/useSaleDocumentSearch.js');
const legacyStorePath = path.join(root, 'src/features/sales/store/salesStore.js');
const routesPath = path.join(root, 'src/routes/partner/salesRoutes.jsx');

const read = (filePath) => fs.readFileSync(filePath, 'utf8');
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

[pagePath, indexPath, policyPath, hookPath, legacyStorePath, routesPath].forEach((filePath) => {
  assert(fs.existsSync(filePath), `${filePath} must exist`);
});

const page = read(pagePath);
const index = read(indexPath);
const policy = read(policyPath);
const hook = read(hookPath);
const legacyStore = read(legacyStorePath);
const routes = read(routesPath);

assert(page.includes("from '@/features/sales/documents/search'"), 'Bill list must import document search public boundary');
assert(page.includes('useSaleDocumentSearch'), 'Bill list must consume document search workflow hook');
assert(page.includes('BILL_DOCUMENT_SEARCH_POLICY'), 'Bill list must select Bill policy explicitly');
assert(!page.includes("from '@/features/sales/store/salesStore'"), 'Bill list must not import legacy Sales Store');
assert(!page.includes('printableSales'), 'Bill list must not read legacy printable rows');
assert(!page.includes('loadPrintableSalesAction'), 'Bill list must not call legacy printable action');
assert(page.includes('documentSearch.actions.search'), 'Bill list must search through document search owner');
assert(page.includes("../bill/print-short/${row.id}"), 'Bill list must preserve short print route authority');
assert(page.includes("../bill/print-full/${row.id}"), 'Bill list must preserve full print route authority');

assert(policy.includes("id: 'BILL'"), 'Bill policy identity must remain explicit');
assert(policy.includes('onlyPaid: 1'), 'Bill policy must preserve paid-only query semantics');
assert(policy.includes('changeAmount'), 'Bill policy must project cash change');
assert(policy.includes('balanceAmount'), 'Bill policy must project remaining balance');

assert(hook.includes('useSaleDocumentSearchStore'), 'Workflow hook must consume dedicated document search store');
assert(index.includes('BILL_DOCUMENT_SEARCH_POLICY'), 'Bill policy must be publicly exported');
assert(index.includes('useSaleDocumentSearch'), 'Document search hook must be publicly exported');

assert(legacyStore.includes('printableSales:'), 'Legacy printable state must remain for compatibility');
assert(legacyStore.includes('loadPrintableSalesAction:'), 'Legacy printable action must remain for compatibility');
assert(routes.includes("path: 'bill/print-short/:saleId'"), 'Short bill route must exist');
assert(routes.includes("path: 'bill/print-full/:saleId'"), 'Full bill route must exist');

console.log('Bill document search cutover contract: PASS');
});
