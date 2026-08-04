const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const salesMenu = read('src/config/sidebarSalesItems.js');
const sidebarLoader = read('src/features/pos/components/sidebar/SidebarLoader.jsx');
const header = read('src/features/pos/components/header/HeaderPos.jsx');
const posRoutes = read('src/routes/partner/posPartnerRoutes.jsx');

assert.match(posRoutes, /path:\s*'customers'/);
assert.match(salesMenu, /label:\s*'จัดการลูกค้า'/);
assert.match(salesMenu, /to:\s*`\$\{prefix\}\/customers`/);
assert.match(sidebarLoader, /if \(moduleKey === 'customers'\) return 'sales';/);
assert.doesNotMatch(header, /label:\s*'ลูกค้า'/);
assert.doesNotMatch(header, /getPosRoutePath\('\/customers'\)/);

console.log('customer-pos-management-navigation.contract: PASS');
