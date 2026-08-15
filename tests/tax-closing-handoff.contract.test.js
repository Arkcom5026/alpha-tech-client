import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const read = (relativePath) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

test('tax period list exposes Tax Closing Package action', () => {
  const source = read('src/features/tax/periods/workspace/components/TaxPeriodListTable.jsx');
  assert.match(source, /Tax Closing Package/);
  assert.match(source, /\$\{period\.id\}\/handoff/);
});

test('handoff API reads backend-owned tax closing package', () => {
  const source = read('src/features/tax/handoff/api/taxClosingHandoffApi.js');
  assert.match(source, /getTaxClosingHandoffBundle/);
  assert.match(source, /\/tax\/tax-closing-handoff\//);
  assert.match(source, /branchId/);
});

test('handoff finalization is bound to the exact snapshot reviewed by the user', () => {
  const api = read('src/features/tax/handoff/api/taxClosingHandoffApi.js');
  const page = read('src/features/tax/handoff/pages/TaxClosingHandoffPage.jsx');
  assert.match(api, /requireSnapshotHash/);
  assert.match(api, /expectedSnapshotHash/);
  assert.match(api, /\{ expectedSnapshotHash \}/);
  assert.match(api, /TAX_CLOSING_FINALIZATION_EXPECTED_SNAPSHOT_REQUIRED/);
  assert.match(api, /TAX_CLOSING_FINALIZATION_SNAPSHOT_CHANGED/);
  assert.match(page, /expectedSnapshotHash: data\.snapshotHash/);
});

test('handoff workspace exposes deterministic package identity and readiness state', () => {
  const source = read('src/features/tax/handoff/pages/TaxClosingHandoffPage.jsx');
  assert.match(source, /Snapshot SHA-256/);
  assert.match(source, /packageVersion/);
  assert.match(source, /READY FOR HANDOFF/);
  assert.match(source, /DRAFT — ยังมีรายการต้องจัดการ/);
  assert.match(source, /Readiness Domains/);
});

test('handoff workspace downloads complete manifest bundle VAT expense WHT and PP30 exports', () => {
  const source = read('src/features/tax/handoff/pages/TaxClosingHandoffPage.jsx');
  for (const pattern of [
    /tax-closing-\$\{periodCode\}-manifest\.json/,
    /tax-closing-\$\{periodCode\}-bundle\.json/,
    /output-vat-\$\{periodCode\}\.csv/,
    /input-vat-\$\{periodCode\}\.csv/,
    /tax-expenses-\$\{periodCode\}\.csv/,
    /withholding-tax-\$\{periodCode\}\.csv/,
    /pp30-settlement-\$\{periodCode\}\.json/,
  ]) assert.match(source, pattern);
  assert.match(source, /ไม่ใช่หลักฐานการยื่นต่อกรมสรรพากรโดยตรง/);
});

test('partner route mounts handoff without removing legacy accounting office and tax workspaces', () => {
  const routes = read('src/routes/partner/posPartnerRoutes.jsx');
  assert.match(routes, /TaxClosingHandoffPage/);
  assert.match(routes, /tax-periods\/:taxPeriodId\/handoff/);
  assert.match(routes, /tax-periods\/:taxPeriodId\/accounting-office/);
  assert.match(routes, /tax-periods\/:taxPeriodId\/readiness/);
  assert.match(routes, /tax-periods\/:taxPeriodId\/vat-settlement/);
  assert.match(routes, /tax-periods\/:taxPeriodId\/withholding-tax/);
});
