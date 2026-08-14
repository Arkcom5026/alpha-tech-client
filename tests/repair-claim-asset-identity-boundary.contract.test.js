import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const read = (relativePath) => fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');

const claimBoard = read('src/features/repair/claimQueue/workspace/components/ClaimQueueBoard.jsx');
const claimWorkspace = read('src/features/repair/claimQueue/workspace/components/WarrantyClaimQueueWorkspace.jsx');
const claimRuntime = read('src/features/repair/components/ClaimRuntimePanel.jsx');

test('claim queue consumes claimAsset as its identity presentation authority', () => {
  assert.match(claimBoard, /item\?\.claimAsset \|\| MISSING_CLAIM_ASSET/);
  assert.match(claimBoard, /asset\.displayName/);
  assert.match(claimBoard, /asset\.model/);
  assert.match(claimBoard, /asset\.serialNumber/);
  assert.doesNotMatch(claimBoard, /repairJob\?\.deviceModel/);
  assert.doesNotMatch(claimBoard, /item\.device\?\.model/);
  assert.doesNotMatch(claimBoard, /item\.stockItem\?\.product/);
});

test('warranty claim workspace uses dedicated claim board instead of shared repair queue presentation', () => {
  assert.match(claimWorkspace, /import ClaimQueueBoard from '\.\/ClaimQueueBoard'/);
  assert.match(claimWorkspace, /<ClaimQueueBoard lanes=\{activeLanes\} onOpen=\{onOpenClaim\} \/>/);
  assert.doesNotMatch(claimWorkspace, /from ['"].*components\/QueueBoard/);
});

test('claim detail reads canonical claimAsset before any legacy compatibility display', () => {
  assert.match(claimRuntime, /claim\.claimAsset\?\.displayName/);
  assert.match(claimRuntime, /claim\.claimAsset\?\.serialNumber/);
});
