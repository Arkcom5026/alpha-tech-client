import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const page = read('src/features/customerMoneySettlement/pages/DeliveryCreditSettlementCreatePage.jsx');
const api = read('src/features/customerMoneySettlement/api/deliveryCreditSettlementApi.js');

assert.match(page, /const mountedRef = useRef\(false\)/, 'mounted authority must start inactive and be activated by the effect setup');
assert.match(page, /useEffect\(\(\) => \{[\s\S]*mountedRef\.current = true;[\s\S]*return \(\) => \{[\s\S]*mountedRef\.current = false;/, 'effect setup must restore mounted authority after StrictMode cleanup/setup replay');
assert.match(page, /if \(!ownsRequest\(\)\) return \{ ok: false, stale: true \};[\s\S]*setWorkspace\(nextWorkspace\)/, 'active eligible-sales response must settle the workspace');
assert.match(page, /finally \{[\s\S]*if \(ownsRequest\(\)\) setLoadingCredits\(false\)/, 'active eligible-sales request must end loading state');
assert.match(page, /workspace\?\.balance\?\.availableAmount/, 'Customer Money card must derive available balance from the eligible-sales workspace authority');
assert.match(page, /workspace\.sales\.map/, 'eligible Delivery Notes must render from the settled workspace');
assert.match(api, /response\?\.data\?\.data \?\? response\?\.data/, 'API adapter must accept wrapped and direct response shapes');
assert.match(api, /\/eligible-sales/, 'create runtime must use the established eligible-sales endpoint');

console.log('Customer Money Settlement Create Runtime Contract: PASS');
