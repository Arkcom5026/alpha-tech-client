import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const read = (relativePath) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

test('tax period list exposes VAT settlement action', () => {
  const source = read('src/features/tax/periods/workspace/components/TaxPeriodListTable.jsx');
  assert.match(source, /VAT Settlement/);
  assert.match(source, /vat-settlement/);
});

test('VAT settlement workspace reads isolated preparation API', () => {
  const api = read('src/features/tax/settlement/api/vatSettlementApi.js');
  const page = read('src/features/tax/settlement/pages/VatSettlementPage.jsx');
  assert.match(api, /tax\/vat-settlement/);
  assert.match(api, /branchId/);
  assert.match(page, /getVatSettlementPreparation/);
});

test('workspace presents payable credit reconciliation and readiness', () => {
  const source = read('src/features/tax/settlement/pages/VatSettlementPage.jsx');
  assert.match(source, /VAT ต้องชำระ/);
  assert.match(source, /VAT เครดิต/);
  assert.match(source, /outputReconciliationDifference/);
  assert.match(source, /readyForPp30Preparation/);
  assert.match(source, /Settlement Exceptions/);
  assert.match(source, /ยังไม่ใช่การยื่นแบบต่อกรมสรรพากร/);
});

test('partner route mounts VAT settlement workspace under tax periods', () => {
  const source = read('src/routes/partner/posPartnerRoutes.jsx');
  assert.match(source, /tax-periods\/:taxPeriodId\/vat-settlement/);
  assert.match(source, /VatSettlementPage/);
  assert.match(source, /path: 'edit\/:id', element: <EditBankPage/);
});
