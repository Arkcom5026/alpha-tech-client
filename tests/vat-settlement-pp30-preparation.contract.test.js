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

test('workspace presents current-period payable credit reconciliation and PP30 readiness', () => {
  const source = read('src/features/tax/settlement/pages/VatSettlementPage.jsx');
  assert.match(source, /VAT ต้องชำระรอบปัจจุบัน/);
  assert.match(source, /VAT เครดิตรอบปัจจุบัน/);
  assert.match(source, /outputReconciliationDifference/);
  assert.match(source, /readyForCurrentPeriodSettlement/);
  assert.match(source, /readyForPp30Preparation/);
  assert.match(source, /Settlement Exceptions/);
  assert.match(source, /ยังไม่ใช่การยื่นแบบต่อกรมสรรพากร/);
});

test('workspace blocks PP30 readiness when carry-forward authority is unresolved', () => {
  const source = read('src/features/tax/settlement/pages/VatSettlementPage.jsx');
  assert.match(source, /carryForwardAuthorityReady/);
  assert.match(source, /VAT_SETTLEMENT_CARRY_FORWARD_AUTHORITY_REQUIRED/);
  assert.match(source, /ภาษีชำระไว้เกินยกมา/);
  assert.match(source, /pp30NetVatAfterCarryForward/);
  assert.match(source, /รอ Authority/);
});

test('partner route mounts VAT settlement workspace under tax periods without route regression', () => {
  const source = read('src/routes/partner/posPartnerRoutes.jsx');
  assert.match(source, /tax-periods\/:taxPeriodId\/vat-settlement/);
  assert.match(source, /VatSettlementPage/);
  assert.match(source, /path: 'edit\/:id', element: <EditBankPage/);
});
