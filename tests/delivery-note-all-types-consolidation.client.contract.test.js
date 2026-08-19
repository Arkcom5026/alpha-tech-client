import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const read = (file) => fs.readFileSync(path.join(dirname, '..', file), 'utf8');

const page = read('src/features/combinedBilling/pages/CombinedBillingPage.jsx');

assert.match(page, /sale\.saleMode === 'CASH'/);
assert.match(page, /line\.saleMode === 'CASH'/);
assert.match(page, /cashLocked/);
assert.match(page, /disabled=\{!ready \|\| mutationBusy \|\| cashLocked\}/);
assert.match(page, /required=\{!cashLocked && changed\}/);
assert.match(page, /line\.paymentAuthority === 'SALE_PAYMENT'/);
assert.match(page, /Sale Payment authority/);
assert.match(page, /Settlement authority/);
assert.match(page, /ล็อกราคาหลังชำระ/);
assert.match(page, /SOURCE_TAX_PRESERVED/);
assert.match(page, /CONSOLIDATED_TAX_DRAFT/);
assert.match(page, /ไม่สร้างใบกำกับภาษีซ้ำ/);
assert.match(page, /สิทธิ์ออกใบกำกับภาษีของรายการที่เลือกถูกส่งต่อมาที่เอกสารรวมชุดนี้/);

console.log('Delivery Note all-types consolidation client contract: PASS');
