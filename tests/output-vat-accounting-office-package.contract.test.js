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

test('workspace presents monthly tax closing authorities and readiness', () => {
  const source = read('src/features/tax/periods/pages/AccountingOfficePackagePage.jsx');
  assert.match(source, /Monthly Tax Closing Package/);
  assert.match(source, /readyForAccountingOffice/);
  assert.match(source, /outputVatReady/);
  assert.match(source, /inputVatReady/);
  assert.match(source, /expensesReady/);
  assert.match(source, /withholdingReady/);
  assert.match(source, /READY FOR ACCOUNTANT/);
});

test('workspace exposes output input expense exports and full closing JSON', () => {
  const source = read('src/features/tax/periods/pages/AccountingOfficePackagePage.jsx');
  assert.match(source, /Output VAT CSV/);
  assert.match(source, /Input VAT CSV/);
  assert.match(source, /Expenses CSV/);
  assert.match(source, /Closing JSON/);
  assert.match(source, /OUTPUT_VAT_ADJUSTMENT/);
  assert.match(source, /INPUT_VAT_ADJUSTMENT/);
});

test('workspace renders input tax expense and WHT review projections', () => {
  const source = read('src/features/tax/periods/pages/AccountingOfficePackagePage.jsx');
  assert.match(source, /data\.inputSummary/);
  assert.match(source, /data\.expenseSummary/);
  assert.match(source, /data\.inputDocuments/);
  assert.match(source, /data\.expenses/);
  assert.match(source, /pendingAssessmentItemCount/);
  assert.match(source, /evidenceStatus/);
  assert.match(source, /withholdingPendingCount/);
  assert.match(source, /missingWithholdingCertificateCount/);
  assert.match(source, /hasVerifiedWithholdingCertificate/);
});

test('partner route mounts the accounting office workspace under tax periods', () => {
  const source = read('src/routes/partner/posPartnerRoutes.jsx');
  assert.match(source, /tax-periods\/:taxPeriodId\/accounting-office/);
  assert.match(source, /AccountingOfficePackagePage/);
});
