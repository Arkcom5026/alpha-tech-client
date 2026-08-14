import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

test('intake evidence and handover render only server-owned canonical repairAsset identity', () => {
  const evidence = read('src', 'features', 'repair', 'components', 'IntakeEvidencePanel.jsx');
  const handover = read('src', 'features', 'repair', 'components', 'RepairHandoverPanel.jsx');

  for (const source of [evidence, handover]) {
    assert.match(source, /repairAsset\.displayName/);
    assert.match(source, /repairAsset\.model/);
    assert.match(source, /repairAsset\.serialNumber/);
    assert.doesNotMatch(source, /deviceModel|device\?\.model|stockItem\?\.product/);
  }
});
