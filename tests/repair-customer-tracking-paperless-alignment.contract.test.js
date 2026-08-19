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
  assert.match(source, /repairAsset\.displayName/);
  assert.match(source, /repairAsset\.model/);
  assert.match(source, /repairAsset\.brand/);
  assert.match(source, /repairAsset\.category/);
  assert.match(source, /repairAsset\.serialNumber/);
  assert.match(source, /repairAsset\.imei/);
  assert.match(source, /repairAsset\.barcode/);
  assert.doesNotMatch(source, /repair\.device/);
  assert.doesNotMatch(source, /repair\.deviceModel/);
  assert.doesNotMatch(source, /repair\.assetDescription/);
});

test('customer tracking is status-first and keeps secondary job data on demand', () => {
  const source = read('src/features/repair/customer-tracking/pages/CustomerRepairTrackingPage.jsx');

  assert.match(source, /ตอนนี้งานของคุณ/);
  assert.match(source, /อัปเดตล่าสุด \{formatDateTime\(repair\.lastUpdatedAt\)\}/);
  assert.match(source, /const recentTimeline = \[\.\.\.timeline\]\.slice\(-3\)\.reverse\(\)/);
  assert.match(source, /ดูประวัติก่อนหน้าอีก/);
  assert.match(source, /<details className="rounded-3xl border border-slate-200 bg-white shadow-sm">/);
  assert.match(source, /รายละเอียดงาน/);
  assert.match(source, /const hasMeaningfulEstimate/);
  assert.match(source, /hasMeaningfulEstimate \? \(/);
  assert.match(source, /ลิงก์นี้ใช้ติดตามสถานะงานล่าสุดได้โดยไม่ต้องโทรสอบถามร้าน/);
});

test('customer tracking surfaces follow the mint-green system standard', () => {
  const pageSource = read('src/features/repair/customer-tracking/pages/CustomerRepairTrackingPage.jsx');
  const timelineSource = read('src/features/repair/customer-tracking/components/TrackingTimeline.jsx');

  assert.match(pageSource, /bg-emerald-50/);
  assert.match(pageSource, /text-emerald-700/);
  assert.match(pageSource, /bg-emerald-600/);
  assert.doesNotMatch(pageSource, /(?:bg|text|border)-blue-/);
  assert.match(timelineSource, /bg-emerald-100/);
  assert.match(timelineSource, /bg-emerald-500/);
  assert.doesNotMatch(timelineSource, /(?:bg|text|border)-blue-/);
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

test('staff tracking QR normalizes module-object interop before React render', () => {
  const source = read('src/features/repair/customer-access/components/RepairTrackingAccessPanel.jsx');

  assert.match(source, /import QRCodeModule from 'react-qr-code'/);
  assert.match(
    source,
    /const QRCode = QRCodeModule\?\.default\?\.default \?\? QRCodeModule\?\.default \?\? QRCodeModule/,
  );
  assert.match(source, /<QRCode value=\{trackingUrl\} size=\{132\} level="M" \/>/);
});
