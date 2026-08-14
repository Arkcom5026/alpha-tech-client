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

test('actual repair runtime detail consumes repairAsset as its single identity presentation authority', () => {
  const source = read('src/features/repair/components/JobRuntimePanel.jsx');

  assert.match(source, /const repairAsset = job\?\.repairAsset \|\| null/);
  assert.match(source, /label="ชื่ออุปกรณ์" value=\{repairAsset\?\.displayName\}/);
  assert.match(source, /label="รุ่น \/ Model" value=\{repairAsset\?\.model\}/);
  assert.match(source, /label="บาร์โค้ด" value=\{repairAsset\?\.barcode\}/);
  assert.match(source, /label="Serial" value=\{repairAsset\?\.serialNumber\}/);
  assert.doesNotMatch(source, /job\?\.assetDescription/);
  assert.doesNotMatch(source, /job\?\.deviceModel/);
  assert.doesNotMatch(source, /job\?\.device\?\.model/);
});

test('retired duplicate RepairJobSummary presentation stays removed', () => {
  assert.equal(
    fs.existsSync(resolve('src/features/repair/components/RepairJobSummary.jsx')),
    false
  );
});

test('repair queue consumes canonical repairAsset without rebuilding repair identity from legacy fields', () => {
  const source = read('src/features/repair/components/QueueBoard.jsx');
  const repairResolver = source.match(
    /const getRepairAsset = \(item\) => ([^;]+);/
  )?.[0] || '';

  assert.match(repairResolver, /item\?\.repairAsset/);
  assert.match(repairResolver, /MISSING_REPAIR_ASSET/);
  assert.doesNotMatch(repairResolver, /deviceModel/);
  assert.doesNotMatch(repairResolver, /stockItem/);
  assert.doesNotMatch(repairResolver, /item\.device/);
  assert.match(source, /\{asset\.displayName\}/);
  assert.doesNotMatch(source, /getLegacyClaimAssetFallback/);
  assert.match(source, /item\?\.claimAsset \|\| MISSING_REPAIR_ASSET/);
});
