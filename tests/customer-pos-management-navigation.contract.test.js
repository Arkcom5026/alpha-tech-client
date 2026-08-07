import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const salesMenu = read('src/config/sidebarSalesItems.js');
const sidebarLoader = read('src/features/pos/components/sidebar/SidebarLoader.jsx');
const header = read('src/features/pos/components/header/HeaderPos.jsx');
const posRoutes = read('src/routes/partner/posPartnerRoutes.jsx');

assert.match(posRoutes, /path:\s*'customers'/);
assert.match(salesMenu, /label:\s*'จัดการลูกค้า'/);
assert.match(salesMenu, /to:\s*`\$\{prefix\}\/customers`/);
assert.match(
  sidebarLoader,
  /(?:if\s*\(moduleKey === 'customers'\)\s*return 'sales';|moduleKey === 'customers'\s*\?\s*'sales'\s*:\s*moduleKey)/,
);
assert.doesNotMatch(header, /label:\s*'ลูกค้า'/);
assert.doesNotMatch(header, /getPosRoutePath\('\/customers'\)/);

console.log('customer-pos-management-navigation.contract: PASS');
