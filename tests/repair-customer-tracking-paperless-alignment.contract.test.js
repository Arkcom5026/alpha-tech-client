import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('customer tracking page consumes repairAsset as canonical paperless identity', () => {
  const source = read('src/features/repair/customer-tracking/pages/CustomerRepairTrackingPage.jsx');

  assert.match(source, /const repairAsset = repair\.repairAsset \|\| \{\}/);
  assert.match(source, /\{repairAsset\.displayName \|\| '-'\}/);
  assert.match(source, /label="รุ่น \/ Model" value=\{repairAsset\.model\}/);
  assert.match(source, /label="ยี่ห้อ" value=\{repairAsset\.brand\}/);
  assert.match(source, /label="ประเภท" value=\{repairAsset\.category\}/);
  assert.match(source, /label="Serial Number" value=\{repairAsset\.serialNumber\}/);
  assert.match(source, /label="IMEI" value=\{repairAsset\.imei\}/);
  assert.match(source, /label="Barcode" value=\{repairAsset\.barcode\}/);
  assert.doesNotMatch(source, /repair\.device/);
  assert.doesNotMatch(source, /repair\.deviceModel/);
  assert.doesNotMatch(source, /repair\.assetDescription/);
});

test('public tracking read participates in repair in-flight request dedupe', () => {
  const source = read('src/features/repair/customer-tracking/api/repairTrackingPublicApi.js');

  assert.match(source, /dedupeRepairRead/);
  assert.match(source, /`public-tracking:\$\{normalizedToken\}`/);
  assert.match(source, /repairs\/public\/tracking/);
});

test('staff paperless access remains tokenized QR and share based', () => {
  const source = read('src/features/repair/customer-access/components/RepairTrackingAccessPanel.jsx');

  assert.match(source, /Paperless Customer Access/);
  assert.match(source, /QRCode/);
  assert.match(source, /สร้างลิงก์และ QR/);
  assert.match(source, /navigator\.share/);
  assert.match(source, /revokeTrackingAccess/);
});
