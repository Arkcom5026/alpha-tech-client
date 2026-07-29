const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const base = path.join(root, 'src/features/sales/create/customer');
const paths = {
  searchComponent: path.join(base, 'components/SaleCustomerSearch.jsx'),
  resultsComponent: path.join(base, 'components/SaleCustomerSearchResults.jsx'),
  searchHook: path.join(base, 'hooks/useSaleCustomerSearch.js'),
  editorHook: path.join(base, 'hooks/useSaleCustomerEditor.js'),
  hydrationHook: path.join(base, 'hooks/useSaleCustomerHydration.js'),
  projection: path.join(base, 'projections/saleCustomerSectionProjection.js'),
  index: path.join(base, 'index.js'),
};

const read = (filePath) => fs.readFileSync(filePath, 'utf8');
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

Object.entries(paths).forEach(([name, filePath]) => {
  assert(fs.existsSync(filePath), `${name} must exist`);
});

const searchComponent = read(paths.searchComponent);
const resultsComponent = read(paths.resultsComponent);
const searchHook = read(paths.searchHook);
const editorHook = read(paths.editorHook);
const hydrationHook = read(paths.hydrationHook);
const projection = read(paths.projection);
const index = read(paths.index);

assert(searchComponent.includes("from 'react-input-mask'"), 'Search presentation must preserve phone mask behavior');
assert(searchComponent.includes("searchMode === 'phone'"), 'Search presentation must preserve phone mode');
assert(searchComponent.includes("searchMode === 'name'"), 'Search presentation must preserve name mode');
assert(!searchComponent.includes('apiClient'), 'Search presentation must not call APIs');
assert(!searchComponent.includes('useCustomerDepositStore'), 'Search presentation must not own Deposit state');
assert(!resultsComponent.includes('apiClient'), 'Result presentation must not call APIs');
assert(resultsComponent.includes('onSelect(customer)'), 'Result presentation must delegate selection intent');

assert(searchHook.includes('submitSearch'), 'Search hook must own search execution');
assert(searchHook.includes('setResults'), 'Search hook must own result state');
assert(searchHook.includes('onCustomerNotFound'), 'Search hook must own not-found signaling');
assert(searchHook.includes('/^[0-9]{10}$/'), 'Current 10-digit phone search invariant must remain');
assert(!searchHook.includes('useSalesStore'), 'Search hook must not own Sale state');
assert(!searchHook.includes('useCustomerDepositStore'), 'Search hook must not own Deposit state');

assert(editorHook.includes('validateForSave'), 'Editor hook must own save validation');
assert(editorHook.includes('createPayload'), 'Editor hook must own payload projection');
assert(editorHook.includes('hydrateCustomer'), 'Editor hook must own customer field hydration');
assert(editorHook.includes('addressDetail'), 'Editor hook must own address fields');
assert(!editorHook.includes('apiClient'), 'Editor hook must not call APIs directly');

assert(hydrationHook.includes('searchByCustomerId'), 'Hydration hook must own full customer lookup delegation');
assert(hydrationHook.includes('setCustomerId'), 'Hydration hook must own Sale customer handoff');
assert(hydrationHook.includes('setDepositAmount'), 'Hydration hook must own Deposit projection');
assert(hydrationHook.includes('productSearchRef'), 'Hydration hook must own product-search focus handoff');
assert(!hydrationHook.includes('/repairs/'), 'Hydration hook must not own Repair workflow');

assert(projection.includes('projectSaleCustomerSection'), 'Projection must expose a stable Sale customer view model');
assert(projection.includes('selection'), 'Projection must include selection state');
assert(projection.includes('feedback'), 'Projection must include feedback state');

[
  'SaleCustomerSearch',
  'SaleCustomerSearchResults',
  'useSaleCustomerSearch',
  'useSaleCustomerEditor',
  'useSaleCustomerHydration',
  'projectSaleCustomerSection',
].forEach((symbol) => assert(index.includes(symbol), `${symbol} must be publicly exported`));

console.log('Sale customer responsibility extraction contract: PASS');
