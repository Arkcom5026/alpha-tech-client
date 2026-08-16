import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const source = fs.readFileSync(
  path.resolve('src/features/receiving/quick-stock/hooks/useQuickStockCommitController.js'),
  'utf8',
);

assert.match(source, /useRef/);
assert.match(source, /commitRef\.current/);
assert.match(source, /productIdSnapshot/);
assert.match(source, /queueItemsSnapshot/);
assert.match(source, /queueCountSnapshot/);
assert.match(source, /quick-stock:intake:\$\{productIdSnapshot\}:success/);
assert.match(source, /quick-stock:intake:\$\{productIdSnapshot\}:error/);
assert.match(source, /isCommitting \|\| commitRef\.current/);

console.log('Quick Stock commit mutation authority contract: PASS');
