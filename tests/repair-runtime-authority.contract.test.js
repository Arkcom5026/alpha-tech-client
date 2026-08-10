const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const api = fs.readFileSync(path.join(root, 'src/features/repair/api/repairApi.js'), 'utf8');
const store = fs.readFileSync(path.join(root, 'src/features/repair/store/repairRuntimeStore.js'), 'utf8');
const detail = fs.readFileSync(path.join(root, 'src/features/repair/pages/RepairJobDetailPage.jsx'), 'utf8');

test('client repair runtime has no legacy free-status mutation', () => {
  assert.doesNotMatch(api, /transitionJob\s*:/);
  assert.doesNotMatch(api, /\/repairs\/jobs\/\$\{id\}\/status/);
  assert.doesNotMatch(store, /transitionJob\s*:/);
});

test('repair detail advances only through workflow command authority', () => {
  assert.match(api, /transitionWorkflow\s*:/);
  assert.match(api, /\/workflow\/commands/);
  assert.match(detail, /repairApi\.transitionWorkflow/);
  assert.match(detail, /commandKey/);
});
