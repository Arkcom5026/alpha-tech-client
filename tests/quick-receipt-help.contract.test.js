import assert from 'node:assert/strict';

import quickReceiptHelpContent from '../src/features/receiving/quick-stock/help/quickReceiptHelpContent.js';

const modeCodes = quickReceiptHelpContent.modes.map((mode) => mode.code);
assert.deepEqual(modeCodes, ['RESUMABLE_SESSION', 'ONE_SHOT_COMPLETE']);

const statusCodes = quickReceiptHelpContent.statuses.map(([code]) => code);
for (const requiredStatus of ['LOCAL_DRAFT', 'DRAFT', 'FINALIZING', 'COMPLETED', 'CANCELLED']) {
  assert.ok(statusCodes.includes(requiredStatus), `missing status guidance: ${requiredStatus}`);
}

const searchableText = JSON.stringify(quickReceiptHelpContent).toLowerCase();
for (const requiredText of [
  'supplier',
  'เลขที่ใบส่งของ',
  'ร้านปัจจุบัน',
  'structured product',
  'simple product',
  'barcode',
  'serial',
  'idempotency',
  'local storage',
  'เก็บไว้รับต่อภายหลัง',
  'ยืนยันรับสินค้าครบ',
]) {
  assert.ok(searchableText.includes(requiredText.toLowerCase()), `missing DDWD guidance: ${requiredText}`);
}

assert.ok(quickReceiptHelpContent.steps.length >= 6, 'workflow steps are incomplete');
assert.ok(quickReceiptHelpContent.checklist.length >= 8, 'operational checklist is incomplete');
assert.ok(quickReceiptHelpContent.faq.length >= 5, 'FAQ/recovery guidance is incomplete');
assert.ok(quickReceiptHelpContent.notes.length >= 4, 'authority notes are incomplete');

console.log('Quick Receipt DDWD help contract: PASS');
