import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';

const source = fs.readFileSync('src/features/combinedBilling/store/combinedBillingStore.js', 'utf8');

test('combined billing history/detail reads have request ownership', () => {
  assert.match(source, /combinedBillingHistoryRequestSequence/);
  assert.match(source, /combinedBillingDetailRequestSequence/);
  assert.match(source, /const requestId = \+\+combinedBillingHistoryRequestSequence/);
  assert.match(source, /const requestId = \+\+combinedBillingDetailRequestSequence/);
  assert.match(source, /const documentIdSnapshot = Number\(id\)/);
  assert.match(source, /if \(requestId !== combinedBillingHistoryRequestSequence\) return null/);
  assert.match(source, /if \(requestId !== combinedBillingDetailRequestSequence\) return null/);
});

test('detail context clears prior selected document and stale failures are discarded', () => {
  assert.match(source, /set\(\{ selectedDocument: null \}\)/);
  assert.match(source, /getConsolidatedDelivery\(documentIdSnapshot\)/);
  assert.match(source, /catch \(error\) \{\s*if \(requestId !== combinedBillingDetailRequestSequence\) return null/);
});
