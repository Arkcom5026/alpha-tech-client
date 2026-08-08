import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('canonical sale return workspace behavior contract', () => {
  const searchPage = read('src/features/sales/return/pages/ReturnSearchPage.jsx');
  const createPage = read('src/features/sales/return/pages/CreateReturnPage.jsx');
  const api = read('src/features/sales/return/api/saleReturnApi.js');
  const completeWorkflow = read('src/features/sales/return/workflows/completeSaleReturnWorkflow.js');
  const runtimeSource = `${searchPage}\n${createPage}`;

  it('preserves canonical search loading, filtering and create navigation', () => {
    expect(searchPage).toContain('getReturnableSales()');
    for (const token of [
      'sale.code',
      'sale.customer?.name',
      'sale.customer?.companyName',
      'sale.customer?.phone',
    ]) {
      expect(searchPage).toContain(token);
    }
    expect(searchPage).toContain("navigate(`/${shopSlug}/pos/sales/sale-return/create/${sale.id}`)");
  });

  it('preserves eligibility across serialized and simple sale items', () => {
    expect(createPage).toContain('getSaleReturnEligibility(saleId)');
    expect(createPage).toContain('eligibility?.serializedItems');
    expect(createPage).toContain("kind: 'SERIALIZED'");
    expect(createPage).toContain('eligibility?.simpleItems');
    expect(createPage).toContain("kind: 'SIMPLE'");
    expect(createPage).toContain('eligibleQuantity > 0');
  });

  it('preserves refund amount, deduction and reason guards', () => {
    expect(createPage).toContain('Math.abs(refundTotal - channelTotal) > 0.005');
    expect(createPage).toContain("setError('ยอดช่องทางคืนเงินต้องเท่ากับยอดคืนจริง')");
    expect(createPage).toContain('Math.max(0, eligibleTotal - refundTotal)');
    expect(createPage).toContain("setError('กรุณาระบุเหตุผลเมื่อคืนเงินไม่เต็มจำนวน')");
  });

  it('preserves completion workflow and credit-note routing', () => {
    expect(createPage).toContain('runCompleteSaleReturn({');
    expect(createPage).toContain('issueCreditNoteForSaleReturn({');
    expect(createPage).toContain("code === 'TAX_CREDIT_NOTE_ORIGINAL_DOCUMENT_NOT_FOUND'");
    expect(createPage).toContain('/pos/sales/credit-note/print/${taxDocumentId}?branchId=${completedReturn.branchId}');
    expect(completeWorkflow).toContain('completeSaleReturn');
  });

  it('preserves module-owned help and canonical API authority', () => {
    expect(runtimeSource).toContain('SaleReturnHelpDrawer');
    expect(runtimeSource).toContain('คู่มือ');
    expect(api).toContain('getReturnableSales');
    expect(api).toContain('getSaleReturnEligibility');
    expect(api).toContain('issueCreditNoteForSaleReturn');
  });
});
