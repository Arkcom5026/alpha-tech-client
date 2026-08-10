import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const read = (relativePath) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

test('tax expense API exposes assessment suggestion and confirmation endpoints', () => {
  const source = read('src/features/taxExpense/api/taxExpenseApi.js');
  assert.match(source, /getTaxExpenseAssessmentSuggestion/);
  assert.match(source, /assessment-suggestion/);
  assert.match(source, /confirmTaxExpenseAssessment/);
  assert.match(source, /assessment-confirmation/);
});

test('tax expense workspace exposes human-reviewed assessment action', () => {
  const page = read('src/features/taxExpense/pages/TaxExpenseWorkspacePage.jsx');
  const panel = read('src/features/taxExpense/components/TaxExpenseAssessmentPanel.jsx');
  assert.match(page, /ประเมินภาษี/);
  assert.match(page, /TaxExpenseAssessmentPanel/);
  assert.match(panel, /Rule-assisted Tax Assessment/);
  assert.match(panel, /ผู้ใช้ต้องตรวจและยืนยันเอง/);
  assert.match(panel, /ยืนยันผลการประเมิน/);
});

test('assessment panel keeps WHT in dedicated workflow', () => {
  const source = read('src/features/taxExpense/components/TaxExpenseAssessmentPanel.jsx');
  assert.match(source, /WHT ไม่ถูกแก้จากหน้านี้/);
  assert.match(source, /WHT Workflow/);
  assert.doesNotMatch(source, /whtTreatment:\s*decisions/);
});
