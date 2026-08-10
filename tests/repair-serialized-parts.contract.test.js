const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('repair parts use ready Inventory StockItem selection for serial-controlled products', () => {
  const api = read('src/features/repair/api/repairApi.js');
  const panel = read('src/features/repair/components/RepairExecutionPanel.jsx');

  assert.match(api, /part-stock-options/);
  assert.match(panel, /trackSerialNumber/);
  assert.match(panel, /stockItemId/);
  assert.match(panel, /IN_STOCK/);
  assert.match(panel, /USED/);
  assert.match(panel, /Serial \/ StockItem/);
  assert.match(panel, /รับเข้า Inventory/);
  assert.match(panel, /serializedPartsUsed/);
});

test('quantity parts remain quantity-based without requiring StockItem selection', () => {
  const panel = read('src/features/repair/components/RepairExecutionPanel.jsx');
  assert.match(panel, /qtyUsed/);
  assert.match(panel, /selected\.trackSerialNumber/);
  assert.match(panel, /เบิกและบันทึกอะไหล่/);
});
