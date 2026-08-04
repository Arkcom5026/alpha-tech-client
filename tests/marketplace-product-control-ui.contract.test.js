import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const api = read('src/features/storeExperience/api/storeExperienceApi.js');
const page = read('src/features/storeExperience/pages/OnlineProductVisibilityDashboardPage.jsx');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

assert(api.includes("apiClient.patch(`/partner-store/online-products/${productId}/price`"), 'marketplace mutation API missing');
assert(page.includes('จัดการสินค้าออนไลน์'), 'product editor missing');
assert(page.includes('updateOnlineProductPrice'), 'mutation action missing');
assert(page.includes('บันทึกและตรวจใหม่'), 'save and re-audit action missing');
assert(page.includes('priceOnline') && page.includes('effectiveDate') && page.includes('expiredDate'), 'editable online price fields missing');
assert(!page.includes('costPrice') && !page.includes('priceRetail'), 'UI must not expose accounting prices');
console.log('marketplace product control ui contract: PASS');
