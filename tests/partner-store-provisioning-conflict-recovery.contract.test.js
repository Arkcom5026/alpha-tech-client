import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../src/features/partnerStoreApplication/pages/PartnerStoreApplicationReviewPage.jsx', import.meta.url), 'utf8');

assert.match(page, /codeFrom/);
assert.match(page, /recoverProvisioningConflict/);
assert.match(page, /statusCode === 409/);
assert.match(page, /PARTNER_STORE_PROVISIONING_STATE_CHANGED/);
assert.match(page, /await load\(\{ reportError: false, statusSnapshot \}\)/);
assert.match(page, /pendingActionLockRef\.current = false/);
assert.match(page, /setPendingAction\(null\)/);
assert.match(page, /requiresProvisioningReconciliation/);
assert.match(page, /Boolean\(item\.provisionedBranchId\)/);
assert.match(page, /ซิงก์สถานะร้าน/);
assert.match(page, /ไม่สร้างร้านซ้ำ/);
assert.match(page, /const provisionSuccessMessage = item\.provisionedBranchId/);
assert.match(page, /'ซิงก์สถานะร้านเรียบร้อยแล้ว'/);
assert.match(page, /'สร้างร้านพาร์ตเนอร์เรียบร้อยแล้ว'/);
assert.match(page, /provisionSuccessMessage,/);

console.log('Partner Store Provisioning Conflict Recovery Contract: PASS');
