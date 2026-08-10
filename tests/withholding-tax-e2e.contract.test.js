import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const read = (relativePath) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

test('tax period list exposes WHT workspace action', () => {
  const source = read('src/features/tax/periods/workspace/components/TaxPeriodListTable.jsx');
  assert.match(source, /withholding-tax/);
  assert.match(source, /<ReceiptText size=\{14\} \/>\s*WHT/);
});

test('WHT API exposes treatment certificate prepare and manual submission actions', () => {
  const source = read('src/features/tax/withholding/api/withholdingTaxApi.js');
  assert.match(source, /getWithholdingTaxWorkspace/);
  assert.match(source, /transitionWithholdingTreatment/);
  assert.match(source, /items\/\$\{positiveId\(taxExpenseItemId/);
  assert.match(source, /WITHHOLDING_REQUIRED/);
  assert.match(source, /WITHHELD/);
  assert.match(source, /issueWithholdingCertificate/);
  assert.match(source, /prepareWithholdingFiling/);
  assert.match(source, /submitWithholdingFiling/);
  assert.match(source, /certificates\/issue/);
  assert.match(source, /MANUAL_EXTERNAL_FILING/);
});

test('WHT workspace presents human confirmation certificate PND readiness and exceptions', () => {
  const source = read('src/features/tax/withholding/pages/WithholdingTaxWorkspacePage.jsx');
  assert.match(source, /Withholding Tax Workspace/);
  assert.match(source, /PENDING_REVIEW|Review/);
  assert.match(source, /WITHHOLDING_REQUIRED/);
  assert.match(source, /WITHHELD/);
  assert.match(source, /ยืนยันว่าต้องหัก/);
  assert.match(source, /ยืนยันว่าหักแล้ว/);
  assert.match(source, /ภ\.ง\.ด\.3/);
  assert.match(source, /ภ\.ง\.ด\.53/);
  assert.match(source, /manual filing evidence/);
  assert.match(source, /ยังไม่ใช่ direct e-Filing/);
  assert.match(source, /WHT Readiness/);
  assert.match(source, /WHT Exceptions/);
  assert.match(source, /ออกหนังสือรับรอง/);
});

test('WHT workspace requires manual evidence before submission confirmation', () => {
  const source = read('src/features/tax/withholding/pages/WithholdingTaxWorkspacePage.jsx');
  assert.match(source, /เลขอ้างอิง\/หลักฐานการยื่นภายนอก/);
  assert.match(source, /ยืนยันว่าดำเนินการยื่นภายนอกแล้ว/);
  assert.match(source, /!String\(references\[formType\]/);
});

test('partner route mounts WHT workspace without bank route regression', () => {
  const source = read('src/routes/partner/posPartnerRoutes.jsx');
  assert.match(source, /WithholdingTaxWorkspacePage/);
  assert.match(source, /tax-periods\/:taxPeriodId\/withholding-tax/);
  assert.match(source, /path: 'edit\/:id', element: <EditBankPage/);
});
