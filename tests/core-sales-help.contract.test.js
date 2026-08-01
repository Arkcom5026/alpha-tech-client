import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import coreSalesHelpContent from '../src/features/sales/help/coreSalesHelpContent.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const flatten = (value) => JSON.stringify(value).toLowerCase();
const text = flatten(coreSalesHelpContent);

assert.equal(coreSalesHelpContent.title, 'คู่มือการขายสินค้าและปิดการขาย');
assert.ok(coreSalesHelpContent.steps.length >= 8, 'core sales guide requires an end-to-end operator sequence');
assert.ok(coreSalesHelpContent.lineTypes.length >= 3, 'guide must cover structured, tracked-simple, and non-stock lines');
assert.ok(coreSalesHelpContent.modes.some(([code]) => code === 'CASH'));
assert.ok(coreSalesHelpContent.modes.some(([code]) => code === 'CREDIT'));
assert.ok(coreSalesHelpContent.statusGuide.some(([code]) => code === 'COMPLETED_PAID'));
assert.ok(coreSalesHelpContent.statusGuide.some(([code]) => code === 'COMPLETED_CREDIT'));
assert.ok(coreSalesHelpContent.statusGuide.some(([code]) => code === 'PARTIALLY_PAID'));
assert.ok(coreSalesHelpContent.paymentChecklist.length >= 5);
assert.ok(coreSalesHelpContent.heldCartChecklist.length >= 5);
assert.ok(coreSalesHelpContent.recovery.length >= 5);
assert.match(text, /stock_item/);
assert.match(text, /simple lot/);
assert.match(text, /non_stock/);
assert.match(text, /command identity/);
assert.match(text, /ร้านปัจจุบัน/);
assert.match(text, /งานคืนสินค้าและคืนเงินเป็น workflow แยก/);

const drawer = read('src/features/sales/help/CoreSalesHelpDrawer.jsx');
assert.match(drawer, /coreSalesHelpContent/);
assert.match(drawer, /role="dialog"/);
assert.match(drawer, /aria-modal="true"/);
assert.match(drawer, /onClose/);

const page = read('src/features/sales/create/pages/CreateSalePage.jsx');
assert.match(page, /CoreSalesHelpDrawer/);
assert.match(page, /isHelpOpen/);
assert.match(page, /เปิดคู่มือการขายสินค้า/);
assert.match(page, /<PaymentSection/);
assert.match(page, /<PosHeldCartPanel/);
assert.doesNotMatch(page, /SaleReturn|return workflow|คืนสินค้าและคืนเงิน/);

const packageJson = JSON.parse(read('package.json'));
assert.equal(
  packageJson.scripts['test:core-sales-help'],
  'vitest run tests/core-sales-help.contract.test.js',
  'package.json must expose the dedicated Core Sales help contract command',
);

const workflow = read('.github/workflows/frontend-ci.yml');
assert.match(workflow, /npm run test:core-sales-help/);
assert.ok(
  workflow.indexOf('npm run test:core-sales-help') < workflow.indexOf('npm run build'),
  'Core Sales help contract must run before Production Build',
);

console.log('core-sales-help integration contract: PASS');
