const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const searchPath = path.join(
  root,
  'src/features/sales/create/customer/components/SaleCustomerSearch.jsx'
);
const resultsPath = path.join(
  root,
  'src/features/sales/create/customer/components/SaleCustomerSearchResults.jsx'
);
const indexPath = path.join(root, 'src/features/sales/create/customer/index.js');

const read = (filePath) => fs.readFileSync(filePath, 'utf8');
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const search = read(searchPath);
const results = read(resultsPath);
const index = read(indexPath);

assert(search.includes("from 'react-input-mask'"), 'Structural extraction must preserve phone mask behavior');
assert(search.includes("searchMode === 'phone'"), 'Structural extraction must preserve phone mode');
assert(search.includes("searchMode === 'name'"), 'Structural extraction must preserve name mode');
assert(search.includes('ป้อนเบอร์โทร 10 หลักแล้วกด Enter'), 'Phone search copy must remain');
assert(results.includes("searchMode !== 'name'"), 'Results must remain name-mode-only in this increment');
assert(results.includes('onSelect(customer)'), 'Search results must delegate customer selection');
assert(index.includes('SaleCustomerSearch'), 'Search component must be publicly exported');
assert(index.includes('SaleCustomerSearchResults'), 'Result component must be publicly exported');
assert(!search.includes('/repairs/'), 'Sale search component must not own Repair search');
assert(!results.includes('/repairs/'), 'Sale result component must not own Repair search');

console.log('Sale customer section structural extraction contract: PASS');
