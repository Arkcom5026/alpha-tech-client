import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const read = (relativePath) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

test('tax period list exposes accounting office package action', () => {
  const source = read('src/features/tax/periods/workspace/components/TaxPeriodListTable.jsx');
  assert.match(source, /ส่งสำนักงานบัญชี/);
  assert.match(source, /accounting-office/);
});

test('accounting office workspace reads isolated package api', () => {
  const api = read('src/features/tax/periods/api/accountingOfficePackageApi.js');
  const page = read('src/features/tax/periods/pages/AccountingOfficePackagePage.jsx');
  assert.match(api, /tax\/accounting-office\/packages/);
  assert.match(api, /branchId/);
  assert.match(page, /getAccountingOfficePackage/);
});

test('workspace exposes readiness and accounting exports', () => {
  const source = read('src/features/tax/periods/pages/AccountingOfficePackagePage.jsx');
  assert.match(source, /readyForAccountingOffice/);
  assert.match(source, /CSV รายงานภาษีขาย/);
  assert.match(source, /ชุดข้อมูล JSON/);
  assert.match(source, /OUTPUT_VAT_ADJUSTMENT/);
});

test('partner route mounts the accounting office workspace under tax periods', () => {
  const source = read('src/routes/partner/posPartnerRoutes.jsx');
  assert.match(source, /tax-periods\/:taxPeriodId\/accounting-office/);
  assert.match(source, /AccountingOfficePackagePage/);
});
