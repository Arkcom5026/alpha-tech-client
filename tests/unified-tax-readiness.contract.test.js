import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const read = (relativePath) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

test('tax period list exposes unified readiness action', () => {
  const source = read('src/features/tax/periods/workspace/components/TaxPeriodListTable.jsx');
  assert.match(source, /Tax Readiness|ความพร้อมภาษี/);
  assert.match(source, /\$\{period\.id\}\/readiness/);
});

test('unified readiness API reads backend-owned authority projection', () => {
  const source = read('src/features/tax/readiness/api/unifiedTaxReadinessApi.js');
  assert.match(source, /getUnifiedTaxReadiness/);
  assert.match(source, /\/tax\/tax-readiness\//);
  assert.match(source, /branchId/);
});

test('readiness workspace presents percentage domains and Thai closing state', () => {
  const source = read('src/features/tax/readiness/pages/UnifiedTaxReadinessPage.jsx');
  assert.match(source, /ศูนย์ตรวจความพร้อมภาษี/);
  assert.match(source, /readinessPercent/);
  assert.match(source, /readyDomainCount/);
  assert.match(source, /พร้อมสำหรับขั้นตอนส่งต่อ/);
  assert.match(source, /รายการที่ต้องจัดการ/);
  assert.doesNotMatch(source, />Tax Exceptions</);
});

test('readiness cards follow backend-owned operational source targets', () => {
  const source = read('src/features/tax/readiness/pages/UnifiedTaxReadinessPage.jsx');
  assert.match(source, /entry\.target\?\.relativePath/);
  assert.match(source, /domain\.target/);
  assert.match(source, /ไปดำเนินการ/);
  assert.match(source, /\/pos\/finance\//);
});

test('tax expense workspace honors record-aware assessment deep links', () => {
  const source = read('src/features/taxExpense/pages/TaxExpenseWorkspacePage.jsx');
  assert.match(source, /useSearchParams/);
  assert.match(source, /assessmentExpenseId/);
  assert.match(source, /setSearchParams/);
  assert.match(source, /openAssessment/);
});

test('partner routes mount unified readiness and filing workspaces without replacing existing tax routes', () => {
  const routes = read('src/routes/partner/posPartnerRoutes.jsx');
  assert.match(routes, /UnifiedTaxReadinessPage/);
  assert.match(routes, /InputTaxFilingWorkspacePage/);
  assert.match(routes, /tax-periods\/:taxPeriodId\/readiness/);
  assert.match(routes, /tax-periods\/:taxPeriodId\/input-vat-filing/);
  assert.match(routes, /tax-periods\/:taxPeriodId\/vat-settlement/);
  assert.match(routes, /tax-periods\/:taxPeriodId\/withholding-tax/);
  assert.match(routes, /tax-periods\/:taxPeriodId\/accounting-office/);
});
