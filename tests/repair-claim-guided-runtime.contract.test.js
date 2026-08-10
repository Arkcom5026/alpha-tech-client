const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const runtimePath = path.resolve(__dirname, '../src/features/repair/components/ClaimRuntimePanel.jsx');
const source = fs.readFileSync(runtimePath, 'utf8');

test('claim runtime uses guided action cards instead of a free next-status dropdown', () => {
  assert.match(source, /Next Action/);
  assert.match(source, /ดำเนินการขั้นถัดไป/);
  assert.doesNotMatch(source, /เลือกสถานะถัดไป/);
  assert.match(source, /ACTION_COPY/);
});

test('claim runtime sends optimistic expectedStatus with every guided transition', () => {
  assert.match(source, /expectedStatus:\s*claim\.status/);
});

test('claim rejection and cancellation require an operator reason', () => {
  assert.match(source, /\['REJECTED', 'CANCELLED'\]\.includes\(selectedAction\)/);
  assert.match(source, /requiresReason/);
});

test('claim resolution asks only for result-specific fields', () => {
  assert.match(source, /resolutionRequiresReplacement/);
  assert.match(source, /resolutionRequiresCredit/);
  assert.match(source, /รหัส StockItem สินค้าทดแทน/);
  assert.match(source, /ยอดเครดิต/);
});
