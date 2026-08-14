import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

test('repair and claim runtime consumers use canonical asset search and presentation', () => {
  const repairPolicy = read('src', 'features', 'repair', 'queue', 'workspace', 'policies', 'repairQueuePolicy.js');
  const claimPolicy = read('src', 'features', 'repair', 'claimQueue', 'workspace', 'policies', 'warrantyClaimQueuePolicy.js');
  const claimRuntime = read('src', 'features', 'repair', 'components', 'ClaimRuntimePanel.jsx');
  const queueBoard = read('src', 'features', 'repair', 'components', 'QueueBoard.jsx');

  assert.match(repairPolicy, /job\?\.repairAsset\?\.displayName/);
  assert.doesNotMatch(repairPolicy, /job\?\.deviceModel|job\?\.device\?\.|job\?\.stockItem\?\./);
  assert.doesNotMatch(claimPolicy, /claim\?\.device\?\.|claim\?\.stockItem\?\./);
  assert.doesNotMatch(claimRuntime, /repairJob\?\.deviceModel/);
  assert.doesNotMatch(queueBoard, /getLegacyClaimAssetFallback|repairJob\?\.deviceModel|item\.device\.model/);
});

test('tax expense repair reference consumes server-owned repairAsset', () => {
  const source = read('src', 'features', 'taxExpense', 'components', 'TaxExpenseCreateForm.jsx');
  assert.match(source, /repairJob\?\.repairAsset\?\.displayName/);
  assert.doesNotMatch(source, /repairJob\?\.deviceModel/);
});

test('retired duplicate repair cards stay deleted', () => {
  for (const name of ['RepairJobCard.jsx', 'WarrantyClaimCard.jsx', 'WarrantyClaimSummary.jsx', 'RepairCreateForm.jsx']) {
    assert.equal(fs.existsSync(path.join(root, 'src', 'features', 'repair', 'components', name)), false);
  }
  assert.equal(fs.existsSync(path.join(root, 'src', 'features', 'repair', 'utils', 'repairValidation.js')), false);
});
