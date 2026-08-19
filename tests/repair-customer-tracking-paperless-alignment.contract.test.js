import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveQrCodeComponent } from '../src/features/repair/customer-access/utils/resolveQrCodeComponent.js';

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
  assert.match(source, /อัปเดตล่าสุด \{formatDateTime\(headline\.updatedAt\)\}/);
  assert.match(source, /const recentTimeline = \[\.\.\.timeline\]\.slice\(-3\)\.reverse\(\)/);
  assert.match(source, /ดูประวัติก่อนหน้าอีก/);
  assert.match(source, /<details className="rounded-3xl border border-slate-200 bg-white shadow-sm">/);
  assert.match(source, /รายละเอียดงาน/);
  assert.match(source, /const hasMeaningfulEstimate/);
  assert.match(source, /hasMeaningfulEstimate \? \(/);
  assert.match(source, /ลิงก์นี้ใช้ติดตามสถานะงานล่าสุดได้โดยไม่ต้องโทรสอบถามร้าน/);
});

test('customer headline follows latest customer-visible progress without changing workflow stage', () => {
  const source = read('src/features/repair/customer-tracking/pages/CustomerRepairTrackingPage.jsx');

  assert.match(source, /const getCustomerHeadline = \(\{ status, handover, timeline, fallbackUpdatedAt \}\) =>/);
  assert.match(source, /const latestVisibleEvent = timeline\.length \? timeline\[timeline\.length - 1\] : null/);
  assert.match(source, /label: latestVisibleEvent\.title \|\| resolvedStatus\.label/);
  assert.match(source, /description: latestVisibleEvent\.description \|\| resolvedStatus\.description/);
  assert.match(source, /updatedAt: latestVisibleEvent\.occurredAt \|\| fallbackUpdatedAt/);
  assert.match(source, /const stage = Number\(headline\.stage \|\| 0\)/);
  assert.match(source, /status=\{headline\}/);
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

test('QR resolver accepts production interop shapes but rejects module objects', () => {
  const Component = () => null;
  const ReactObjectComponent = { $$typeof: Symbol.for('react.forward_ref') };

  assert.equal(resolveQrCodeComponent(Component), Component);
  assert.equal(resolveQrCodeComponent({ default: Component }), Component);
  assert.equal(resolveQrCodeComponent({ default: { default: Component } }), Component);
  assert.equal(resolveQrCodeComponent({ QRCode: Component }), Component);
  assert.equal(resolveQrCodeComponent({ default: { QRCode: Component } }), Component);
  assert.equal(resolveQrCodeComponent({ default: ReactObjectComponent }), ReactObjectComponent);
  assert.equal(resolveQrCodeComponent({ default: { unexpected: true } }), null);
});

test('staff tracking QR cannot render an unresolved module object in production', () => {
  const source = read('src/features/repair/customer-access/components/RepairTrackingAccessPanel.jsx');
  const resolverSource = read('src/features/repair/customer-access/utils/resolveQrCodeComponent.js');

  assert.match(source, /import \* as QRCodeModule from 'react-qr-code'/);
  assert.match(source, /resolveQrCodeComponent\(QRCodeModule\)/);
  assert.match(source, /QRCode \? \(/);
  assert.match(source, /QR ไม่พร้อมใช้งาน กรุณาใช้ลิงก์ด้านข้าง/);
  assert.match(resolverSource, /moduleValue\?\.QRCode/);
  assert.match(resolverSource, /candidate\.\$\$typeof/);
  assert.doesNotMatch(source, /const QRCode = QRCodeModule\?\.default\?\.default/);
});
