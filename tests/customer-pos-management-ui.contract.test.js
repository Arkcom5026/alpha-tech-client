const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const page = read('src/features/customer/pages/ListCustomersPage.jsx');
const api = read('src/features/customer/api/customerApi.js');
const routes = read('src/routes/partner/customerPartnerRoutes.jsx');

assert.match(routes, /ListCustomersPage/);
assert.match(page, /ลูกค้าของร้าน/);
assert.match(page, /ลูกค้ากลางรอจัดสรร/);
assert.match(page, /claimUnassignedCustomer/);
assert.match(page, /รับเป็นลูกค้าของร้าน/);
assert.match(page, /scope === 'STORE'/);
assert.match(api, /\/customers\/management/);
assert.match(api, /\/management\/unassigned\/\$\{customerProfileId\}\/claim/);

console.log('customer-pos-management-ui.contract: PASS');
