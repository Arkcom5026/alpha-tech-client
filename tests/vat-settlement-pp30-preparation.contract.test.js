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

test('VAT settlement workspace reads settlement and carry-forward authority APIs', () => {
  const api = read('src/features/tax/settlement/api/vatSettlementApi.js');
  const page = read('src/features/tax/settlement/pages/VatSettlementPage.jsx');
  assert.match(api, /tax\/vat-settlement/);
  assert.match(api, /tax\/vat-carry-forward/);
  assert.match(api, /confirmVatCarryForwardAuthority/);
  assert.match(api, /branchId/);
  assert.match(page, /getVatSettlementPreparation/);
  assert.match(page, /VatCarryForwardAuthorityPanel/);
});

test('workspace presents PP30 payable credit reconciliation and readiness', () => {
  const source = read('src/features/tax/settlement/pages/VatSettlementPage.jsx');
  assert.match(source, /VAT ต้องชำระตาม ภ\.พ\.30/);
  assert.match(source, /VAT เครดิตคงเหลือตาม ภ\.พ\.30/);
  assert.match(source, /outputReconciliationDifference/);
  assert.match(source, /pp30VatPayable/);
  assert.match(source, /pp30VatCredit/);
  assert.match(source, /readyForCurrentPeriodSettlement/);
  assert.match(source, /readyForPp30Preparation/);
  assert.match(source, /Settlement Exceptions/);
  assert.match(source, /ยังไม่ใช่การยื่นแบบต่อกรมสรรพากร/);
});

test('carry-forward panel exposes source amount note status and confirmation', () => {
  const source = read('src/features/tax/settlement/components/VatCarryForwardAuthorityPanel.jsx');
  assert.match(source, /เครดิต VAT ยกมา/);
  assert.match(source, /PRIOR_PERIOD/);
  assert.match(source, /HISTORICAL_OPENING/);
  assert.match(source, /ยอดเครดิตยกมา/);
  assert.match(source, /หมายเหตุ \/ หลักฐานอ้างอิง/);
  assert.match(source, /ยืนยันเครดิตยกมา/);
  assert.match(source, /authority\?\.version/);
  assert.match(source, /LOCKED/);
  assert.match(source, /SUBMITTED/);
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
