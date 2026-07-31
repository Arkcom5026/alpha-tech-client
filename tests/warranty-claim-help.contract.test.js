import assert from 'node:assert/strict';
import warrantyClaimHelpSection from '../src/features/repair/help/warrantyClaimHelpContent.js';

const statusCodes = warrantyClaimHelpSection.statusTable.map(([code]) => code);
const requiredStatuses = [
  'DRAFT',
  'SUBMITTED',
  'IN_TRANSIT',
  'RECEIVED_BY_PROVIDER',
  'INSPECTING',
  'APPROVED',
  'REJECTED',
  'REPAIRING',
  'REPLACEMENT_PENDING',
  'CREDIT_PENDING',
  'RESOLVED',
  'CANCELLED',
];

for (const status of requiredStatuses) {
  assert.ok(statusCodes.includes(status), `missing claim status guidance: ${status}`);
}

assert.equal(warrantyClaimHelpSection.id, 'claim');
assert.ok(warrantyClaimHelpSection.steps.length >= 7, 'claim steps must be operationally complete');
assert.ok(warrantyClaimHelpSection.checklist.length >= 8, 'claim checklist must cover operational evidence');
assert.ok(warrantyClaimHelpSection.faq.length >= 5, 'claim FAQ must cover common recovery cases');

const fullText = JSON.stringify(warrantyClaimHelpSection);
for (const requiredText of [
  'Active Claim',
  'StockItem',
  'Device',
  'Replacement Stock Item',
  'Credit Amount',
  'ร้านเดียวกัน',
  'RESOLVED',
  'CANCELLED',
]) {
  assert.ok(fullText.includes(requiredText), `missing claim authority guidance: ${requiredText}`);
}

console.log('Warranty Claim Help DDWD contract: PASS');
