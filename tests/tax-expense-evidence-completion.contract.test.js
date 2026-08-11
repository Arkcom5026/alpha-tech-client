import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const read = (relativePath) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

test('tax expense api exposes evidence verification action', () => {
  const api = read('src/features/taxExpense/api/taxExpenseApi.js');
  assert.match(api, /verifyTaxExpenseEvidence/);
  assert.match(api, /\/evidence\/verify/);
});

test('tax expense workspace exposes human evidence verification and status', () => {
  const page = read('src/features/taxExpense/pages/TaxExpenseWorkspacePage.jsx');
  assert.match(page, /evidenceStatus/);
  assert.match(page, /ยืนยันหลักฐาน/);
  assert.match(page, /หลักฐานครบแล้ว/);
  assert.match(page, /verifyTaxExpenseEvidence/);
  assert.match(page, /await load\(\)/);
});
