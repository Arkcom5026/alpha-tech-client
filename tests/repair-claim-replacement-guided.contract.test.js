const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const panel = fs.readFileSync(path.join(root, 'src/features/repair/components/ClaimRuntimePanel.jsx'), 'utf8');
const api = fs.readFileSync(path.join(root, 'src/features/repair/api/repairApi.js'), 'utf8');

test('claim replacement resolution uses guided stock selection instead of raw StockItem ID', () => {
  assert.match(panel, /เลือกสินค้าทดแทนจากสต๊อกสาขา/);
  assert.match(panel, /ค้นหาชื่อสินค้า \/ Barcode \/ Serial/);
  assert.match(panel, /getReplacementOptions\(claim\.id, replacementQuery\)/);
  assert.doesNotMatch(panel, /รหัส StockItem สินค้าทดแทน/);
  assert.match(panel, /preferredMatch/);
});

test('replacement lookup uses claim-scoped repair API and resolution still sends optimistic status', () => {
  assert.match(api, /warranty-claims\/\$\{id\}\/replacement-options/);
  assert.match(panel, /expectedStatus: claim\.status/);
  assert.match(panel, /replacementStockItemId: resolutionRequiresReplacement/);
});
