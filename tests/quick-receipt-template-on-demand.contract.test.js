import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.resolve(root, relativePath), 'utf8');

const apiSource = read('src/features/receiving/quick-stock/api/quickStockApi.js');
const storeSource = read('src/features/receiving/quick-stock/store/quickStockRuntimeStore.js');
const runtimeSource = read('src/features/receiving/quick-stock/hooks/useQuickStockRuntimeController.js');
const discoverySource = read('src/features/receiving/quick-stock/hooks/useQuickStockDiscoveryController.js');
const productSource = read('src/features/receiving/quick-stock/hooks/useQuickStockProductController.js');
const commitSource = read('src/features/receiving/quick-stock/hooks/useQuickStockCommitController.js');
const pageSource = read('src/features/receiving/quick-stock/pages/QuickStockPage.jsx');
const resultSource = read('src/features/receiving/components/quick-stock/ProductSearchResults.jsx');

assert.match(apiSource, /products\/pos\/search/);
assert.match(apiSource, /products\/template\/search/);
assert.match(apiSource, /products\/pos\/create-from-template/);
assert.doesNotMatch(apiSource, /runtime-by-template/);

assert.match(storeSource, /materializeTemplateProductAction/);
assert.match(storeSource, /materializeQuickStockTemplateProduct/);
assert.doesNotMatch(storeSource, /getOperationalProductByTemplateIdAction/);
assert.doesNotMatch(storeSource, /createOperationalProductFromTemplateAction/);

assert.match(runtimeSource, /materializeTemplateProductAction/);
assert.doesNotMatch(runtimeSource, /getOperationalProductByTemplateIdAction/);

assert.match(discoverySource, /hideTemplateResultsWhenOperationalExists/);
assert.match(
  discoverySource,
  /hideTemplateResultsWhenOperationalExists\(\s*dedupeDiscoveryProducts\(\[\.\.\.operationalList, \.\.\.templateList\]\)\s*\)/
);
assert.match(discoverySource, /setRuntimeSearchProducts\(merged\)/);

assert.match(productSource, /selectedTemplateProduct/);
assert.match(productSource, /materializeTemplateProductAction\(payload\)/);
assert.match(productSource, /useEffect\(\(\) => \{/);
assert.match(productSource, /adoptOperationalProduct\(rawProduct, selectedTemplateProduct\)/);
assert.match(productSource, /setSelectedProductId\(`OPERATIONAL:\$\{nextOperationalProduct\.id\}`\)/);
assert.doesNotMatch(productSource, /handleCreateOperationalProductFromTemplate/);
assert.doesNotMatch(productSource, /getOperationalProductByTemplateIdAction/);

assert.match(commitSource, /productId: Number\(operationalProduct\.id\)/);
assert.doesNotMatch(commitSource, /templateProductId:/);

assert.doesNotMatch(pageSource, /TemplateOperationalProductAdoptionPanel/);
assert.doesNotMatch(pageSource, /handleCreateOperationalProductFromTemplate/);
assert.match(resultSource, /Template · เตรียมให้อัตโนมัติ/);
assert.match(resultSource, /ระบบจะเตรียม Local Product ของร้านให้อัตโนมัติ/);

const retiredPanelPath = path.resolve(
  root,
  'src/features/receiving/quick-stock/components/TemplateOperationalProductAdoptionPanel.jsx'
);
assert.equal(fs.existsSync(retiredPanelPath), false, 'explicit adoption panel must be retired');

console.log('Quick Receipt Template-on-Demand Contract: PASS');
