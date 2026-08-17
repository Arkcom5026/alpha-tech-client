import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '..');
const page = fs.readFileSync(
  path.join(root, 'src/features/customerMoneySettlement/pages/DeliveryCreditSettlementCreatePage.jsx'),
  'utf8',
);

assert.match(page, /const balanceLoaded = Boolean\(workspace && !loadingCredits\)/, 'balance authority must only become loaded after workspace resolution');
assert.match(page, /const balance = balanceLoaded \? Number\(workspace\?\.balance\?\.availableAmount \|\| 0\) : 0/, 'numeric zero fallback must stay internal until balance authority has loaded');
assert.match(page, /const canSubmit = balanceLoaded && selectedLines\.length > 0/, 'settlement submit must be blocked until balance authority is loaded');
assert.match(page, /กำลังตรวจสอบยอดพร้อมใช้\.\.\./, 'loading state must be explicit instead of presenting zero as authoritative');
assert.match(page, /balanceLoaded[\s\S]*฿\{money\(balance\)\}[\s\S]*กำลังตรวจสอบยอดพร้อมใช้/s, 'rendering must distinguish loaded balance from loading state');

console.log('Customer Money Settlement Loading Authority Client Contract: PASS');
