import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const read = (relativePath) => fs.readFileSync(path.resolve(__dirname, '..', relativePath), 'utf8');

const discoverySource = read('src/features/receiving/quick-stock/hooks/useQuickStockDiscoveryController.js');
const apiSource = read('src/features/receiving/quick-stock/api/quickStockApi.js');
const productControllerSource = read('src/features/receiving/quick-stock/hooks/useQuickStockProductController.js');

assert.match(apiSource, /Promise\.allSettled\(/);
assert.match(apiSource, /products\/pos\/search/);
assert.match(apiSource, /products\/template\/search/);
assert.match(apiSource, /delete sanitizedPayload\.branchId/);
assert.match(apiSource, /products\/pos\/create-from-template/);

assert.doesNotMatch(discoverySource, /hideTemplateResultsWhenOperationalExists/);
assert.doesNotMatch(discoverySource, /Number\(getProductTypeId\(product\)\)\s*!==\s*Number\(ptId\)/);
assert.match(discoverySource, /ProductType filtering is authoritative on the backend/);
assert.match(discoverySource, /operationalList/);
assert.match(discoverySource, /templateList/);
assert.match(discoverySource, /dedupeDiscoveryProducts\(\[\.\.\.operationalList, \.\.\.templateList\]\)/);

assert.match(productControllerSource, /getOperationalProductByTemplateIdAction\(templateProductId\)/);
assert.match(productControllerSource, /createOperationalProductFromTemplateAction\(payload\)/);
assert.match(productControllerSource, /adoptOperationalProduct\(rawCreatedProduct, selectedTemplateProduct\)/);

console.log('Product Template Clone Discovery Alignment Contract: PASS');
