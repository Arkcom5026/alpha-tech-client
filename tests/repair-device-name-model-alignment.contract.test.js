const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function read(relativePath) {
  return fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
}

test('mobile repair intake separates human-readable device name from optional model', () => {
  const source = read('src/features/repair/components/ExternalDeviceIntakeForm.jsx');

  assert.match(source, /ชื่ออุปกรณ์ \*/);
  assert.match(source, /รุ่น \/ Model/);
  assert.match(source, /Canon G2010/);
  assert.match(source, /model: draft\.model/);
  assert.match(source, /patch\('model', event\.target\.value\)/);
});

test('repair detail shows device name and technical model as separate fields', () => {
  const source = read('src/features/repair/components/RepairJobSummary.jsx');

  assert.match(source, /label="ชื่ออุปกรณ์"/);
  assert.match(source, /label="รุ่น \/ Model"/);
  assert.match(source, /job\.repairAsset\?\.displayName/);
  assert.match(source, /job\.repairAsset\?\.model/);
});

test('repair queue keeps the repair asset display name as the compact primary label', () => {
  const source = read('src/features/repair/components/QueueBoard.jsx');

  assert.match(source, /if \(item\.repairAsset\) return item\.repairAsset/);
  assert.match(source, /\{asset\.displayName\}/);
});
