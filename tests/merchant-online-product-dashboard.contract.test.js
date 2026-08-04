import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const api = read('src/features/storeExperience/api/storeExperienceApi.js');
const page = read('src/features/storeExperience/pages/OnlineProductVisibilityDashboardPage.jsx');
const routes = read('src/routes/partner/posPartnerRoutes.jsx');
const settings = read('src/features/settings/pages/SettingsDashboardPage.jsx');

const includes = (source, value, label) => assert.ok(source.includes(value), `${label} missing: ${value}`);

includes(api, "'/partner-store/online-products/visibility-audit'", 'visibility audit API');
includes(page, 'Marketplace Control Center', 'dashboard title');
includes(page, 'audit?.summary?.sellableNow', 'sellable summary');
includes(page, 'audit?.summary?.blocked', 'blocked summary');
includes(page, 'REASON_LABELS', 'reason labels');
includes(page, "['SELLABLE_NOW', 'พร้อมขาย']", 'sellable filter');
includes(page, "['BLOCKED', 'ถูกบล็อก']", 'blocked filter');
includes(routes, "path: 'online-products'", 'protected online product route');
includes(settings, 'จัดการสินค้าออนไลน์', 'settings entry');
includes(settings, '/pos/settings/online-products', 'settings navigation');
assert.doesNotMatch(page, /costPrice|avgCost|supplierPrice/, 'dashboard must not expose internal cost data');

console.log('merchant online product dashboard contract: PASS');
