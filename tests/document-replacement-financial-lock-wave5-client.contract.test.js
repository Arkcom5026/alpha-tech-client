import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const api = read('src/features/sales/documents/replacement/api/saleDocumentReplacementApi.js');
const hook = read('src/features/sales/documents/replacement/hooks/useSaleDocumentReplacement.js');
const adapter = read('src/features/sales/documents/replacement/adapters/saleDocumentReplacementAdapter.js');
const panel = read('src/features/deliveryNote/components/workspace/DeliveryNoteReplacementPanel.jsx');
const page = read('src/features/deliveryNote/pages/PrintDeliveryNotePage.jsx');

assert.match(api, /\/document-replacement/);
assert.match(api, /\/document-replacement\/lines/);
assert.match(api, /\/document-replacement\/lock/);
assert.match(api, /status\) === 404/);

assert.match(hook, /useSaleDocumentReplacement/);
assert.match(hook, /replacement\?\.status !== 'DRAFT'/);
assert.match(hook, /onLocked\?\./);
assert.match(hook, /toast\.actionSuccess/);
assert.match(hook, /toast\.actionError/);

assert.match(panel, /Financial Lock/);
assert.match(panel, /สร้างฉบับทดแทน/);
assert.match(panel, /ยืนยันฉบับทดแทน/);
assert.match(panel, /IN_BUDGET/);
assert.match(panel, /OUT_OF_BUDGET/);
assert.match(panel, /replacement\.reason/);
assert.doesNotMatch(panel, /productId|stockItemId|saleItemId/);

assert.match(adapter, /buildReplacementPrintableItems/);
assert.match(adapter, /authority\?\.lines/);
assert.match(adapter, /replacementLine: true/);

assert.match(page, /useSaleDocumentReplacement/);
assert.match(page, /DeliveryNoteReplacementPanel/);
assert.match(page, /replacementEnabled = !isConsolidated && preparation\?\.status === 'LOCKED'/);
assert.match(page, /deliveryNoteAuthority\?\.document\?\.replacement/);
assert.match(page, /buildReplacementPrintableItems/);
assert.match(page, /if \(replacementAuthorityActive\) return replacementSaleItems/);
assert.match(page, /onLocked: loadCurrentDocument/);

console.log('Document replacement financial lock Wave 5 client contract: PASS');
