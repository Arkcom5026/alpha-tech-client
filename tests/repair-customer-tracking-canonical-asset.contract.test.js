import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const resolve = (relativePath) => path.join(__dirname, '..', relativePath);
const read = (relativePath) => fs.readFileSync(resolve(relativePath), 'utf8');

test('paperless customer tracking consumes repairAsset as its only repair identity authority', () => {
  const source = read('src/features/repair/customer-tracking/pages/CustomerRepairTrackingPage.jsx');

  assert.match(source, /const repairAsset = repair\.repairAsset \|\| \{\}/);
  assert.match(source, /repairAsset\.displayName/);
  assert.match(source, /repairAsset\.model/);
  assert.match(source, /repairAsset\.brand/);
  assert.match(source, /repairAsset\.category/);
  assert.match(source, /repairAsset\.serialNumber/);
  assert.match(source, /repairAsset\.imei/);
  assert.match(source, /repairAsset\.barcode/);
  assert.doesNotMatch(source, /const device = repair\.device/);
  assert.doesNotMatch(source, /device\.displayName/);
  assert.doesNotMatch(source, /device\.model/);
});

test('paperless tracking labels device name and Model independently', () => {
  const source = read('src/features/repair/customer-tracking/pages/CustomerRepairTrackingPage.jsx');

  assert.match(source, /สิ่งที่นำมาซ่อม/);
  assert.match(source, /label="รุ่น \/ Model"/);
  assert.match(source, /label="ยี่ห้อ"/);
  assert.match(source, /label="ประเภท"/);
});

test('public tracking GET participates in the repair in-flight read coordinator', () => {
  const source = read('src/features/repair/customer-tracking/api/repairTrackingPublicApi.js');

  assert.match(source, /dedupeRepairRead/);
  assert.match(source, /public-tracking:/);
  assert.match(source, /axios\.get/);
});
