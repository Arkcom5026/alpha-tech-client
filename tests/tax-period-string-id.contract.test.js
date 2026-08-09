import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const api = fs.readFileSync('src/features/tax/periods/api/taxPeriodApi.js', 'utf8');

test('tax period detail accepts string period identifiers', () => {
  assert.match(api, /const requireTextId = \(value, fieldName\) =>/);
  assert.match(api, /const normalizedTaxPeriodId = requireTextId\(taxPeriodId, 'taxPeriodId'\);/);
  assert.match(api, /`\/tax\/periods\/\$\{encodeURIComponent\(normalizedTaxPeriodId\)\}`/);
});

test('tax period transitions use the same string identifier contract', () => {
  const matches = api.match(/const normalizedTaxPeriodId = requireTextId\(taxPeriodId, 'taxPeriodId'\);/g) || [];
  assert.equal(matches.length, 2);
  assert.match(api, /`\/tax\/periods\/\$\{encodeURIComponent\(normalizedTaxPeriodId\)\}\/\$\{normalizedAction\.toLowerCase\(\)\}`/);
});

test('branch authority remains a positive integer contract', () => {
  assert.match(api, /const normalizedBranchId = requirePositiveId\(branchId, 'branchId'\);/);
});
