import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'vitest';

test('Sale customer responsibility extraction contract', () => {
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = path.join(root, 'src/features/sales/create/customer');
const paths = {
  shell: path.join(base, 'SaleCustomerSection.jsx'),
  searchComponent: path.join(base, 'components/SaleCustomerSearch.jsx'),
  resultsComponent: path.join(base, 'components/SaleCustomerSearchResults.jsx'),
  detailsComponent: path.join(base, 'components/SaleCustomerDetailsForm.jsx'),
  searchHook: path.join(base, 'hooks/useSaleCustomerSearch.js'),
  editorHook: path.join(base, 'hooks/useSaleCustomerEditor.js'),
  hydrationHook: path.join(base, 'hooks/useSaleCustomerHydration.js'),
  projection: path.join(base, 'projections/saleCustomerSectionProjection.js'),
  index: path.join(base, 'index.js'),
  createSalePage: path.join(root, 'src/features/sales/create/pages/CreateSalePage.jsx'),
  customerApi: path.join(root, 'src/features/customer/api/customerApi.js'),
  customerStore: path.join(root, 'src/features/customer/store/customerStore.js'),
};

const read = (filePath) => fs.readFileSync(filePath, 'utf8');
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

Object.entries(paths).forEach(([name, filePath]) => {
  assert(fs.existsSync(filePath), `${name} must exist`);
});

const shell = read(paths.shell);
const searchComponent = read(paths.searchComponent);
const resultsComponent = read(paths.resultsComponent);
const detailsComponent = read(paths.detailsComponent);
const searchHook = read(paths.searchHook);
const editorHook = read(paths.editorHook);
const hydrationHook = read(paths.hydrationHook);
const projection = read(paths.projection);
const index = read(paths.index);
const createSalePage = read(paths.createSalePage);
const customerApi = read(paths.customerApi);
const customerStore = read(paths.customerStore);

assert(!searchComponent.includes('react-input-mask'), 'Unified search must not require a phone-only mask');
assert(!searchComponent.includes('searchMode'), 'Unified search must not expose caller-selected modes');
assert(searchComponent.includes('ชื่อ เบอร์โทร บริษัท หน่วยงาน อีเมล หรือเลขผู้เสียภาษี'), 'Search presentation must describe the customer-only fields');
assert(searchComponent.includes('ไม่ค้นหาสินค้า บาร์โค้ด หรือหมายเลขอุปกรณ์'), 'Sale search must state the device-search boundary');
assert(!searchComponent.includes('apiClient'), 'Search presentation must not call APIs');
assert(!searchComponent.includes('useCustomerDepositStore'), 'Search presentation must not own Deposit state');
assert(!resultsComponent.includes('apiClient'), 'Result presentation must not call APIs');
assert(resultsComponent.includes('onSelect(customer)'), 'Result presentation must delegate selection intent');
assert(resultsComponent.includes('customer.phone'), 'Results must expose phone evidence');
assert(detailsComponent.includes('AddressForm'), 'Details presentation must own address rendering');
assert(!detailsComponent.includes('apiClient'), 'Details presentation must not call APIs');

assert(searchHook.includes('submitSearch'), 'Search hook must own search execution');
assert(searchHook.includes('setResults'), 'Search hook must own result state');
assert(searchHook.includes('onCustomerNotFound'), 'Search hook must own not-found signaling');
assert(searchHook.includes('searchCustomers(text)'), 'Search hook must use unified customer authority');
assert(!searchHook.includes('searchByPhone'), 'Search hook must retire phone-mode authority');
assert(!searchHook.includes('searchByName'), 'Search hook must retire name-mode authority');
assert(!searchHook.includes('useSalesStore'), 'Search hook must not own Sale state');
assert(!searchHook.includes('useCustomerDepositStore'), 'Search hook must not own Deposit state');

assert(customerApi.includes("apiClient.get('/customers/search'"), 'Customer API must call the unified search endpoint');
assert(customerStore.includes('searchStoreCustomersAction'), 'Customer store must expose unified search authority');

assert(editorHook.includes('validateForSave'), 'Editor hook must own save validation');
assert(editorHook.includes('createPayload'), 'Editor hook must own payload projection');
assert(editorHook.includes('hydrateCustomer'), 'Editor hook must own customer field hydration');
assert(editorHook.includes('addressDetail'), 'Editor hook must own address fields');
assert(!editorHook.includes('apiClient'), 'Editor hook must not call APIs directly');

assert(hydrationHook.includes('searchByCustomerId'), 'Hydration hook must own full customer/deposit lookup delegation');
assert(hydrationHook.includes('setCustomerId'), 'Hydration hook must own Sale customer handoff');
assert(hydrationHook.includes('setDepositAmount'), 'Hydration hook must own Deposit projection');
assert(hydrationHook.includes('productSearchRef'), 'Hydration hook must own product-search focus handoff');
assert(!hydrationHook.includes('/repairs/'), 'Hydration hook must not own Repair workflow');

assert(projection.includes('projectSaleCustomerSection'), 'Projection must expose a stable Sale customer view model');
assert(projection.includes('query: search.query'), 'Projection must expose the unified query');
assert(projection.includes('selection'), 'Projection must include selection state');
assert(projection.includes('feedback'), 'Projection must include feedback state');

assert(shell.includes('searchStoreCustomersAction'), 'Composition shell must use Customer Search authority');
assert(shell.includes('searchCustomerByCustomerIdAndDepositAction'), 'Deposit lookup must occur after selection');
assert(!shell.includes('searchCustomerByPhoneAndDepositAction'), 'Deposit module must not own Sale search');
assert(!shell.includes('searchCustomerByNameAndDepositAction'), 'Deposit module must not own Sale search');
assert(shell.includes('useSaleCustomerSearch'), 'Composition shell must delegate search responsibility');
assert(shell.includes('useSaleCustomerEditor'), 'Composition shell must delegate editor responsibility');
assert(shell.includes('useSaleCustomerHydration'), 'Composition shell must delegate hydration responsibility');
assert(shell.includes('projectSaleCustomerSection'), 'Composition shell must consume projection');
assert(shell.includes('<SaleCustomerSearch'), 'Composition shell must render search presentation');
assert(shell.includes('<SaleCustomerSearchResults'), 'Composition shell must render results presentation');
assert(shell.includes('!view.selection.selectedCustomer && ('), 'Search results must be hidden after a customer is selected');
assert(shell.includes('<SaleCustomerDetailsForm'), 'Composition shell must render details presentation');
assert(!shell.includes('/repairs/'), 'Composition shell must not own Repair workflow');

assert(createSalePage.includes("from '../customer'"), 'Create Sale runtime must import the customer feature boundary');
assert(!createSalePage.includes("from '../components/CustomerSection'"), 'Create Sale runtime must stop importing the legacy CustomerSection');

[
  'SaleCustomerSection',
  'SaleCustomerSearch',
  'SaleCustomerSearchResults',
  'SaleCustomerDetailsForm',
  'useSaleCustomerSearch',
  'useSaleCustomerEditor',
  'useSaleCustomerHydration',
  'projectSaleCustomerSection',
].forEach((symbol) => assert(index.includes(symbol), `${symbol} must be publicly exported`));

console.log('Sale customer responsibility extraction contract: PASS');
});
