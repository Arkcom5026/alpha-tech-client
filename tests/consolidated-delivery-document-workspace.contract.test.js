import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dirname = path.dirname(fileURLToPath(import.meta.url));
const read = (file) => fs.readFileSync(path.join(dirname, '..', file), 'utf8');

const page = read('src/features/combinedBilling/pages/CombinedBillingPage.jsx');
const api = read('src/features/combinedBilling/api/combinedBillingApi.js');
const store = read('src/features/combinedBilling/store/combinedBillingStore.js');
const customerFilter = read('src/features/combinedBilling/components/CustomerFilter.jsx');

assert.match(api, /\/combined-billing\/document-workspace/);
assert.match(api, /\/combined-billing\/document-workspace\/confirm/);
assert.match(store, /loadDocumentWorkspaceAction/);
assert.match(store, /confirmDocumentWorkspaceAction/);
assert.match(page, /line\.status === 'PAID_READY'/);
assert.match(page, /documentUnitPrice/);
assert.match(page, /adjustmentReason/);
assert.match(page, /Tax Document #/);
assert.match(page, /setSelected\(\{\}\)/);
assert.match(store, /return customers/);
assert.match(customerFilter, /const loadedCustomers = await loadCustomersWithPendingSalesAction\(\)/);
assert.match(customerFilter, /Array\.isArray\(loadedCustomers\)/);
console.log('Consolidated delivery document workspace client contract: PASS');
