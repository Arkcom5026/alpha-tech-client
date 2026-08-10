const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');

test('claim resolution outcome renders replacement and device consequences', () => {
  const panel = read('src/features/repair/components/ClaimResolutionOutcomePanel.jsx');
  const workspace = read('src/features/repair/claimDetail/workspace/components/WarrantyClaimDetailWorkspace.jsx');

  assert.match(panel, /claim\?\.status !== 'RESOLVED'/);
  assert.match(panel, /replacementStockItem/);
  assert.match(panel, /CLAIM_REPLACEMENT/);
  assert.match(panel, /ยุติการใช้งานแล้ว/);
  assert.match(panel, /กลับมาใช้งานได้/);
  assert.match(workspace, /ClaimResolutionOutcomePanel/);
});
