import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const page = read('src/features/customer/pages/ListCustomersPage.jsx');
const resultTable = read('src/features/customer/components/workspace/CustomerResultTable.jsx');
const api = read('src/features/customer/api/customerApi.js');
const routes = read('src/routes/partner/customerPartnerRoutes.jsx');

assert.match(routes, /ListCustomersPage/);
assert.match(page, /ลูกค้าของร้าน/);
assert.match(page, /ลูกค้ากลางรอจัดสรร/);
assert.match(page, /claimUnassignedCustomer/);
assert.match(page, /onClaim=\{claimCustomer\}/);
assert.match(resultTable, /รับเป็นลูกค้าของร้าน/);
assert.match(page, /scope === 'STORE'/);
assert.match(api, /\/customers\/management/);
assert.match(api, /\/management\/unassigned\/\$\{customerProfileId\}\/claim/);

console.log('customer-pos-management-ui.contract: PASS');
