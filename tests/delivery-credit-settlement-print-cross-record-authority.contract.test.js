import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const filePath = path.resolve('src/features/customerMoneySettlement/pages/DeliveryCreditSettlementPrintPage.jsx');
const source = fs.readFileSync(filePath, 'utf8');

assert.match(source, /useRef/);
assert.match(source, /recordContextRef/);
assert.match(source, /loadRequestRef/);
assert.match(source, /const settlementIdSnapshot = id/);
assert.match(source, /const requestId = \+\+loadRequestRef\.current/);
assert.match(source, /recordContextRef\.current = settlementIdSnapshot/);
assert.match(source, /loadRequestRef\.current === requestId/);
assert.match(source, /recordContextRef\.current === settlementIdSnapshot/);
assert.match(source, /setRecord\(null\)/);
assert.match(source, /setError\(''\)/);
assert.match(source, /getDeliveryCreditSettlement\(settlementIdSnapshot\)/);
assert.match(source, /if \(!ownsRequest\(\)\) return;/);
assert.match(source, /customer-money-settlement:print:\$\{settlementIdSnapshot\}:load:error/);
assert.match(source, /recordContextRef\.current = null/);
assert.match(source, /loadRequestRef\.current \+= 1/);

console.log('Delivery Credit Settlement Print Cross-record Authority Contract: PASS');
