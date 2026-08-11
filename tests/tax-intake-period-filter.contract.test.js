import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

const root = process.cwd();
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const apiSource = read('src', 'features', 'tax', 'intake', 'api', 'taxIntakeApi.js');
const controllerSource = read('src', 'features', 'tax', 'intake', 'hooks', 'useTaxIntakeWorkspaceController.js');
const filterSource = read('src', 'features', 'tax', 'intake', 'components', 'TaxIntakePeriodFilterBar.jsx');
const documentListSource = read('src', 'features', 'tax', 'intake', 'components', 'TaxIntakeDocumentList.jsx');
const pageSource = read('src', 'features', 'tax', 'intake', 'pages', 'TaxIntakeWorkspacePage.jsx');
const readinessSource = read('src', 'features', 'tax', 'readiness', 'pages', 'UnifiedTaxReadinessPage.jsx');

test('tax intake API forwards taxPeriodId to candidate and document list authority', () => {
  assert.match(apiSource, /listTaxCandidates = async \(\{ branchId, taxPeriodId,/);
  assert.match(apiSource, /listTaxDocuments = async \(\{ branchId, taxPeriodId,/);
  assert.match(apiSource, /\{ taxPeriodId: optionalText\(taxPeriodId\) \}/);
});

test('tax intake controller restores deep-link filters and loads authoritative periods', () => {
  assert.match(controllerSource, /useSearchParams/);
  assert.match(controllerSource, /listTaxPeriods/);
  assert.match(controllerSource, /searchParams\.get\('taxPeriodId'\)/);
  assert.match(controllerSource, /searchParams\.get\('documentStatus'\)/);
  assert.match(controllerSource, /searchParams\.get\('documentType'\)/);
  assert.match(controllerSource, /taxPeriodId:\s*taxPeriodId \|\| undefined/);
  assert.match(controllerSource, /documentType:\s*documentType \|\| undefined/);
});

test('workspace makes period, status and document type filters visible to the user', () => {
  assert.match(filterSource, /กรองตามรอบภาษี/);
  assert.match(filterSource, /ระบบใช้วันเริ่มและวันสิ้นสุดของรอบภาษีเป็นเกณฑ์/);
  assert.match(filterSource, /ทุกรอบภาษี/);
  assert.match(documentListSource, /ฉบับร่าง \(DRAFT\)/);
  assert.match(documentListSource, /ใบกำกับภาษีขาย/);
  assert.match(documentListSource, /ใบกำกับภาษีซื้อ/);
  assert.match(pageSource, /TaxIntakePeriodFilterBar/);
  assert.match(pageSource, /handleTaxPeriodChange/);
});

test('readiness explains output draft blocker in Thai before period close', () => {
  assert.match(readinessSource, /OUTPUT_VAT_DRAFTS_REMAIN/);
  assert.match(readinessSource, /มีเอกสารภาษีขายฉบับร่างที่ยังต้องจัดการ/);
  assert.match(readinessSource, /เลือกประเภทใบกำกับภาษีก่อนปิดรอบ/);
});
