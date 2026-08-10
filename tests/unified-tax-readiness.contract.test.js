import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const read = (relativePath) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

test('tax period list exposes unified readiness action', () => {
  const source = read('src/features/tax/periods/workspace/components/TaxPeriodListTable.jsx');
  assert.match(source, /Tax Readiness/);
  assert.match(source, /\$\{period\.id\}\/readiness/);
});

test('unified readiness API reads backend-owned authority projection', () => {
  const source = read('src/features/tax/readiness/api/unifiedTaxReadinessApi.js');
  assert.match(source, /getUnifiedTaxReadiness/);
  assert.match(source, /\/tax\/tax-readiness\//);
  assert.match(source, /branchId/);
});

test('readiness workspace presents percentage six domains and accountant state', () => {
  const source = read('src/features/tax/readiness/pages/UnifiedTaxReadinessPage.jsx');
  assert.match(source, /ศูนย์ตรวจความพร้อมภาษี/);
  assert.match(source, /readinessPercent/);
  assert.match(source, /readyDomainCount/);
  assert.match(source, /READY FOR ACCOUNTANT/);
  assert.match(source, /Tax Exceptions/);
});

test('exception cards navigate to backend-owned source targets', () => {
  const source = read('src/features/tax/readiness/pages/UnifiedTaxReadinessPage.jsx');
  assert.match(source, /entry\.target\?\.relativePath/);
  assert.match(source, /กดเพื่อไปแก้ที่ต้นทาง/);
  assert.match(source, /\/pos\/finance\//);
});

test('partner routes mount unified readiness workspace without replacing existing tax routes', () => {
  const routes = read('src/routes/partner/posPartnerRoutes.jsx');
  assert.match(routes, /UnifiedTaxReadinessPage/);
  assert.match(routes, /tax-periods\/:taxPeriodId\/readiness/);
  assert.match(routes, /tax-periods\/:taxPeriodId\/vat-settlement/);
  assert.match(routes, /tax-periods\/:taxPeriodId\/withholding-tax/);
  assert.match(routes, /tax-periods\/:taxPeriodId\/accounting-office/);
});
