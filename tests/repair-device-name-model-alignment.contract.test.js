import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolve(relativePath) {
  return path.join(__dirname, '..', relativePath);
}

function read(relativePath) {
  return fs.readFileSync(resolve(relativePath), 'utf8');
}

test('mobile repair intake separates human-readable device name from optional model', () => {
  const source = read('src/features/repair/components/ExternalDeviceIntakeForm.jsx');

  assert.match(source, /ชื่ออุปกรณ์ \*/);
  assert.match(source, /รุ่น \/ Model/);
  assert.match(source, /Canon G2010/);
  assert.match(source, /model: draft\.model/);
  assert.match(source, /patch\('model', event\.target\.value\)/);
});

test('actual repair runtime detail is the device naming presentation authority', () => {
  const source = read('src/features/repair/components/JobRuntimePanel.jsx');

  assert.match(source, /label="ชื่ออุปกรณ์"/);
  assert.match(source, /label="รุ่น \/ Model"/);
  assert.match(source, /job\?\.repairAsset\?\.displayName/);
  assert.match(source, /job\?\.repairAsset\?\.model/);
  assert.match(source, /job\?\.assetDescription/);
  assert.match(source, /job\?\.deviceModel/);
});

test('retired duplicate RepairJobSummary presentation stays removed', () => {
  assert.equal(
    fs.existsSync(resolve('src/features/repair/components/RepairJobSummary.jsx')),
    false
  );
});

test('repair queue keeps the repair asset display name as the compact primary label', () => {
  const source = read('src/features/repair/components/QueueBoard.jsx');

  assert.match(source, /if \(item\.repairAsset\) return item\.repairAsset/);
  assert.match(source, /\{asset\.displayName\}/);
});
