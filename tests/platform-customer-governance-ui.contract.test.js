import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const routes = read('src/routes/superadmin/superAdminRoutes.jsx');
const sidebar = read('src/config/sidebarSuperadminItems.js');
const page = read('src/features/platformCustomer/pages/PlatformCustomerOverviewPage.jsx');
const api = read('src/features/platformCustomer/api/platformCustomerApi.js');

assert.match(routes, /path:\s*'customers'/);
assert.match(routes, /PlatformCustomerOverviewPage/);
assert.match(sidebar, /label:\s*'Platform Customers'/);
assert.match(sidebar, /governance\/customers/);
assert.match(page, /READ ONLY/);
assert.match(page, /Platform Customer Overview/);
assert.match(page, /จังหวัดของร้าน/);
assert.match(page, /อำเภอของร้าน/);
assert.match(page, /relationshipStatus/);
assert.match(page, /customerType/);
assert.match(page, /accountStatus/);
assert.match(page, /Multi-store Identities/);
assert.match(page, /ไม่ใช่ที่อยู่ส่วนตัวของลูกค้า/);
assert.match(page, /ยังไม่ถูกสร้างจากธุรกรรมแพลตฟอร์ม/);
assert.match(page, /<table/);
assert.match(page, /<thead/);
assert.match(page, /<tbody/);
assert.match(page, /User ID/);
assert.match(page, /เบอร์ \/ Login/);
assert.match(page, /สถานะความสัมพันธ์/);
assert.match(page, /จำนวนร้าน/);
assert.match(page, /Legacy NULL/);
assert.match(page, /ร้านที่เกี่ยวข้อง/);
assert.match(page, /overflow-x-auto/);
assert.doesNotMatch(page, /<article/);
assert.match(api, /\/customers\/platform\/overview/);
assert.match(api, /provinceCode/);
assert.match(api, /districtCode/);
assert.match(api, /branchId/);
assert.doesNotMatch(page, /แก้ไข|ลบลูกค้า|ย้ายร้าน|รวมลูกค้า/);

console.log('platform-customer-governance-ui.contract: PASS');
