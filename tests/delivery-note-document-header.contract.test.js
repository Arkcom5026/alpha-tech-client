import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const page = read('src/features/deliveryNote/pages/PrintDeliveryNotePage.jsx');
const policy = read('src/features/deliveryNote/print/workspace/policies/deliveryNotePrintPolicy.js');
const form = read('src/features/deliveryNote/components/DeliveryNoteForm.jsx');
const scope = read('src/features/branch/documentHeader/StoreDocumentHeaderScope.jsx');
const saleController = read('src/features/sales/documents/workspace/index.js');

assert.match(page, /StoreDocumentHeaderScope/, 'delivery note page must use the shared store document header scope');
assert.match(page, /config=\{preparedConfig\}/, 'delivery note scope and print shell must receive the resolved branch config');

assert.match(policy, /buildStoreDocumentHeader/, 'delivery note policy must reuse the shared document header resolver');
assert.match(policy, /documentType:\s*'DELIVERY_NOTE'/, 'delivery note must resolve its own document type override');
assert.match(policy, /branch:\s*\{ \.\.\.branch, fullAddress \}/, 'delivery note must preserve the complete branch address while resolving shared header config');

assert.match(form, /dn-print-page/, 'delivery note A4 pages must retain the established pagination surface');
assert.match(scope, /\.dn-print-page/, 'shared document header scope must explicitly support delivery note A4 pages');
assert.match(scope, /--store-document-header-logo-image/, 'delivery note adapter must consume the configured store logo');
assert.match(scope, /--store-document-header-logo-size/, 'delivery note adapter must consume the configured custom logo size');
assert.match(scope, /store-document-header-logo-center.*dn-print-page/s, 'delivery note adapter must support centered logos');
assert.match(scope, /store-document-header-logo-right.*dn-print-page/s, 'delivery note adapter must support right-aligned logos');
assert.match(scope, /store-document-header-logo-left[\s\S]*display: flex; flex-direction: column; justify-content: center;/, 'delivery note left logo must vertically center the full store-copy block');
assert.match(scope, /store-document-header-logo-right[\s\S]*display: flex; flex-direction: column; justify-content: center;/, 'delivery note right logo must vertically center the full store-copy block');
assert.match(scope, /store-document-header-hide-address.*dn-print-page/s, 'delivery note adapter must honor address visibility');
assert.match(scope, /store-document-header-hide-phone.*dn-print-page/s, 'delivery note adapter must honor phone visibility');
assert.match(scope, /store-document-header-hide-tax-id.*dn-print-page/s, 'delivery note adapter must honor tax ID visibility');
assert.match(scope, /--store-document-header-note/, 'delivery note adapter must honor the shared header note');

assert.ok(saleController.length > 0, 'sale document workspace authority must remain available');

console.log('Delivery Note Document Header Contract: PASS');
