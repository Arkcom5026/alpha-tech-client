import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const page = read('src/features/customerMoneySettlement/pages/DeliveryCreditSettlementCreatePage.jsx');

assert.match(page, /const balanceReady = Boolean\(workspace\) && !loadingCredits/, 'settlement actions must wait for authoritative balance load');
assert.match(page, /กำลังตรวจสอบยอดพร้อมใช้/, 'loading state must explain that Customer Money is still being resolved');
assert.match(page, /loadingCredits[\s\S]*workspace[\s\S]*฿\{money\(balance\)\}/, 'money amount must render only after the workspace has loaded');
assert.doesNotMatch(page, /Customer Money พร้อมใช้<\/div><div[^>]*>฿\{money\(balance\)\}/, 'selected customer must not immediately render a false zero balance');
assert.match(page, /const canSubmit = balanceReady &&/, 'settlement confirmation must remain disabled until balance authority is ready');

console.log('Customer Money Settlement Balance Loading Client Contract: PASS');
