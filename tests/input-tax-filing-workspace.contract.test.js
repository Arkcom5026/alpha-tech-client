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

test('filing API uses canonical preparation, lifecycle, select and remove routes', () => {
  const api = read('src/features/tax/inputFiling/api/inputTaxFilingApi.js');
  assert.match(api, /\/tax-intake\/input-documents\/filing\/periods\/\$\{periodId\(taxPeriodId\)\}\/workspace/);
  assert.match(api, /\/tax-intake\/input-documents\/filing\/periods\/\$\{periodId\(taxPeriodId\)\}\/prepare/);
  assert.match(api, /\/tax-intake\/documents\/\$\{positiveId\(taxDocumentId, 'taxDocumentId'\)\}\/transition/);
  assert.match(api, /documents\/\$\{positiveId\(taxDocumentId, 'taxDocumentId'\)\}\/select/);
  assert.match(api, /documents\/\$\{positiveId\(taxDocumentId, 'taxDocumentId'\)\}\/remove/);
  assert.doesNotMatch(api, /\/file/);
});

test('Thai-first workspace guides approval before filing preparation and avoids government-filing claims', () => {
  const page = read('src/features/tax/inputFiling/pages/InputTaxFilingWorkspacePage.jsx');
  assert.match(page, /เตรียมชุดภาษีซื้อสำหรับปิดรอบ/);
  assert.match(page, /ยังไม่ใช่การยื่นแบบต่อกรมสรรพากร/);
  assert.match(page, /ขั้นตอนที่ 1 · ตรวจและอนุมัติใบกำกับภาษีซื้อ/);
  assert.match(page, /ขั้นตอนที่ 2 · เริ่มเตรียมชุดภาษีซื้อ/);
  assert.match(page, /ขั้นตอนที่ 3 · ชุดภาษีซื้อ/);
  assert.match(page, /ขั้นตอนที่ 4 · กลับไปตรวจความพร้อมภาษี/);
  assert.match(page, /ยืนยันเป็นรายการภาษีซื้อ/);
  assert.match(page, /pendingApprovalCount/);
});

test('client follows backend lifecycle, reconciliation and eligibility projections instead of recreating rules', () => {
  const page = read('src/features/tax/inputFiling/pages/InputTaxFilingWorkspacePage.jsx');
  assert.match(page, /document\.canAdvanceLifecycle/);
  assert.match(page, /document\.nextLifecycleTarget/);
  assert.match(page, /document\.canSelectForFiling/);
  assert.match(page, /document\.eligibility\?\.reasonCodes/);
  assert.match(page, /document\.reconciliation\?\.status/);
  assert.doesNotMatch(page, /0\.07|7\s*\/\s*100|VAT_RATE/);
});

test('readiness explains approval and filing blockers in Thai and follows backend-owned targets', () => {
  const page = read('src/features/tax/readiness/pages/UnifiedTaxReadinessPage.jsx');
  assert.match(page, /INPUT_VAT_DOCUMENT_APPROVAL_REQUIRED/);
  assert.match(page, /INPUT_VAT_FILING_NOT_PREPARED/);
  assert.match(page, /INPUT_VAT_FILING_INCOMPLETE/);
  assert.match(page, /entry\.target\?\.relativePath/);
  assert.match(page, /domain\.target/);
  assert.match(page, /มีใบกำกับภาษีซื้อที่ยังรออนุมัติ/);
});
