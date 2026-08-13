import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const read = (relativePath) => fs.readFileSync(path.resolve(__dirname, '..', relativePath), 'utf8');

const apiSource = read('src/features/purchaseOrder/api/purchaseOrderApi.js');
const searchHookSource = read('src/features/purchaseOrder/hooks/usePurchaseOrderProductSearch.js');
const formHookSource = read('src/features/purchaseOrder/hooks/usePurchaseOrderForm.js');
const editorSource = read('src/features/purchaseOrder/hooks/usePurchaseOrderEditor.js');
const searchTableSource = read('src/features/purchaseOrder/components/ProductSearchTable.jsx');
const payloadSource = read('src/features/purchaseOrder/builders/purchaseOrderPayloadBuilder.js');

assert.match(apiSource, /apiClient\.get\('\/products\/pos\/search'/);
assert.match(apiSource, /apiClient\.get\('\/products\/template\/search'/);
assert.match(apiSource, /apiClient\.post\('\/products\/pos\/create-from-template'/);

assert.match(searchHookSource, /mode === 'create'/);
assert.match(searchHookSource, /Promise\.allSettled\(\[localRequest, templateRequest\]\)/);
assert.match(searchHookSource, /discoverySource: 'LOCAL'/);
assert.match(searchHookSource, /discoverySource: 'TEMPLATE'/);
assert.match(searchHookSource, /linkedTemplateIds/);
assert.match(searchHookSource, /templateProductId/);

assert.match(formHookSource, /mode,/);
assert.match(formHookSource, /usePurchaseOrderProductSearch\(\{/);

assert.match(editorSource, /materializePurchaseOrderTemplateProduct/);
assert.match(editorSource, /mode === 'create'/);
assert.match(editorSource, /discoverySource === 'TEMPLATE'/);
assert.match(editorSource, /unwrapMaterializedProduct/);
assert.match(editorSource, /productId: localProductId/);
assert.match(editorSource, /setProducts/);

assert.match(searchTableSource, /await onAdd\(/);
assert.match(searchTableSource, /discoverySource: product\?\.discoverySource/);
assert.match(searchTableSource, /isTemplateProduct: product\?\.isTemplateProduct === true/);
assert.match(searchTableSource, /templateProductId: product\?\.templateProductId/);
assert.match(searchTableSource, />\s*Template\s*</);

assert.match(payloadSource, /productId: Number\(product\?\.productId \|\| product\?\.id\)/);
assert.doesNotMatch(payloadSource, /templateProductId/);

console.log('Purchase Order Template-on-Demand Contract: PASS');
