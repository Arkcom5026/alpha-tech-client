import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const read = (relativePath) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

test('partner routes expose a period-scoped input tax filing workspace', () => {
  const routes = read('src/routes/partner/posPartnerRoutes.jsx');
  assert.match(routes, /InputTaxFilingWorkspacePage/);
  assert.match(routes, /tax-periods\/:taxPeriodId\/input-vat-filing/);
});

test('filing API uses canonical server workspace and preparation routes', () => {
  const api = read('src/features/tax/inputFiling/api/inputTaxFilingApi.js');
  assert.match(api, /\/tax-intake\/input-documents\/filing\/periods\/\$\{periodId\(taxPeriodId\)\}\/workspace/);
  assert.match(api, /\/tax-intake\/input-documents\/filing\/periods\/\$\{periodId\(taxPeriodId\)\}\/prepare/);
  assert.match(api, /documents\/\$\{positiveId\(taxDocumentId, 'taxDocumentId'\)\}\/select/);
  assert.match(api, /documents\/\$\{positiveId\(taxDocumentId, 'taxDocumentId'\)\}\/remove/);
  assert.doesNotMatch(api, /\/file/);
});

test('Thai-first filing workspace explains preparation is not government filing', () => {
  const page = read('src/features/tax/inputFiling/pages/InputTaxFilingWorkspacePage.jsx');
  assert.match(page, /เตรียมชุดภาษีซื้อสำหรับปิดรอบ/);
  assert.match(page, /ยังไม่ใช่การยื่นแบบต่อกรมสรรพากร/);
  assert.match(page, /เริ่มเตรียมชุดภาษีซื้อ/);
  assert.match(page, /เพิ่มรายการที่พร้อมทั้งหมด/);
  assert.match(page, /กลับไปตรวจความพร้อมภาษี/);
});

test('client follows backend projections instead of recreating tax eligibility', () => {
  const page = read('src/features/tax/inputFiling/pages/InputTaxFilingWorkspacePage.jsx');
  assert.match(page, /document\.canSelectForFiling/);
  assert.match(page, /document\.eligibility\?\.reasonCodes/);
  assert.match(page, /document\.reconciliation\?\.status/);
  assert.doesNotMatch(page, /0\.07|7\s*\/\s*100|VAT_RATE/);
});

test('readiness routes filing blockers directly to the filing workspace', () => {
  const page = read('src/features/tax/readiness/pages/UnifiedTaxReadinessPage.jsx');
  assert.match(page, /INPUT_VAT_FILING_NOT_PREPARED/);
  assert.match(page, /INPUT_VAT_FILING_INCOMPLETE/);
  assert.match(page, /tax-periods\/\$\{taxPeriodId\}\/input-vat-filing/);
  assert.match(page, /ยังไม่ได้เตรียมชุดภาษีซื้อสำหรับรอบนี้/);
});
