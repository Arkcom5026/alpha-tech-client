import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const read = (relativePath) =>
  fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');

test('repair detail has a progressive mount boundary for non-critical panels', () => {
  const source = read(
    'src/features/repair/detail/workspace/components/DeferredRepairPanel.jsx'
  );

  assert.match(source, /IntersectionObserver/);
  assert.match(source, /rootMargin/);
  assert.match(source, /data-repair-deferred-panel/);
  assert.match(source, /typeof IntersectionObserver === 'undefined'/);
});

test('repair detail keeps workflow-critical content eager and defers secondary read owners', () => {
  const source = read(
    'src/features/repair/detail/workspace/components/RepairDetailWorkspace.jsx'
  );

  assert.match(source, /<RepairWorkflowOverview/);
  assert.match(source, /<JobRuntimePanel job=\{job\}/);
  assert.match(source, /<DeferredRepairPanel eager=\{subcontractActive\}/);
  assert.match(source, /<DeferredRepairPanel eager=\{estimateRelevant\}/);
  assert.match(source, /<DeferredRepairPanel eager=\{handoverRelevant\}/);
  assert.match(source, /<DeferredRepairPanel eager=\{evidenceRelevant\}/);
  assert.match(source, /<RepairTrackingAccessPanel/);
  assert.match(source, /<RepairCommunicationPanel/);
});

test('expense payee discovery dedupes concurrent reads without persistent caching', () => {
  const source = read('src/features/taxExpense/api/taxExpenseApi.js');

  assert.match(source, /inFlightExpensePayeeReads = new Map/);
  assert.match(source, /const existing = inFlightExpensePayeeReads\.get\(key\)/);
  assert.match(source, /if \(existing\) return existing/);
  assert.match(source, /\.finally\(\(\) =>/);
  assert.match(source, /inFlightExpensePayeeReads\.delete\(key\)/);
});
