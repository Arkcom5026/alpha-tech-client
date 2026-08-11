import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const read = (relativePath) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

test('handoff api exposes explicit finalization action', () => {
  const api = read('src/features/tax/handoff/api/taxClosingHandoffApi.js');
  assert.match(api, /finalizeTaxClosingHandoffBundle/);
  assert.match(api, /tax-closing-handoff\/.*\/finalize/);
  assert.match(api, /TAX_CLOSING_FINALIZATION_NOT_READY/);
  assert.match(api, /TAX_CLOSING_FINALIZATION_CONFLICT/);
});

test('handoff workspace presents finalization integrity states', () => {
  const page = read('src/features/tax/handoff/pages/TaxClosingHandoffPage.jsx');
  assert.match(page, /NOT_FINALIZED/);
  assert.match(page, /CURRENT/);
  assert.match(page, /STALE/);
  assert.match(page, /Closing Integrity/);
  assert.match(page, /finalizedSnapshotHash/);
  assert.match(page, /finalizationVersion/);
});

test('finalization action is gated by handoff readiness and reloads authoritative bundle', () => {
  const page = read('src/features/tax/handoff/pages/TaxClosingHandoffPage.jsx');
  assert.match(page, /if \(!data\?\.handoffReady \|\| finalizing\) return/);
  assert.match(page, /finalizeTaxClosingHandoffBundle/);
  assert.match(page, /await load\(\)/);
  assert.match(page, /ยืนยัน Snapshot ปิดงวด/);
  assert.match(page, /ยืนยัน Snapshot เวอร์ชันใหม่/);
});

test('bundle and manifest exports retain finalization integrity metadata', () => {
  const page = read('src/features/tax/handoff/pages/TaxClosingHandoffPage.jsx');
  assert.match(page, /finalizationIntegrity: data\.finalizationIntegrity/);
  assert.match(page, /tax-closing-.*-bundle\.json/);
  assert.match(page, /tax-closing-.*-manifest\.json/);
});
