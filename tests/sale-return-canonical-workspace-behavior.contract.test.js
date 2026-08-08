import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('canonical sale return workspace behavior contract', () => {
  const searchPage = read('src/features/sales/return/pages/ReturnSearchPage.jsx');
  const searchPolicy = read('src/features/sales/return/search/policies/filterReturnableSales.js');
  const searchWorkspace = read('src/features/sales/return/search/workspace/SaleReturnSearchWorkspace.jsx');
  const createPage = read('src/features/sales/return/pages/CreateReturnPage.jsx');
  const createPolicy = read('src/features/sales/return/create/policies/saleReturnCreatePolicy.js');
  const createWorkspace = read('src/features/sales/return/create/workspace/SaleReturnCreateWorkspace.jsx');
  const api = read('src/features/sales/return/api/saleReturnApi.js');
  const completeWorkflow = read('src/features/sales/return/workflows/completeSaleReturnWorkflow.js');

  it('preserves canonical search loading, filtering and create navigation', () => {
    expect(searchPage).toContain('getReturnableSales()');
    expect(searchPage).toContain('filterReturnableSales(sales, query)');
    for (const token of [
      'sale?.code',
      'sale?.customer?.name',
      'sale?.customer?.companyName',
      'sale?.customer?.phone',
    ]) {
      expect(searchPolicy).toContain(token);
    }
    expect(searchPage).toContain("navigate(`/${shopSlug}/pos/sales/sale-return/create/${sale.id}`)");
    expect(searchWorkspace).toContain('onSelectSale(sale)');
  });

  it('preserves eligibility across serialized and simple sale items', () => {
    expect(createPage).toContain('getSaleReturnEligibility(saleId)');
    expect(createPage).toContain('buildAvailableReturnItems(eligibility)');
    expect(createPolicy).toContain('eligibility?.serializedItems');
    expect(createPolicy).toContain("kind: 'SERIALIZED'");
    expect(createPolicy).toContain('eligibility?.simpleItems');
    expect(createPolicy).toContain("kind: 'SIMPLE'");
    expect(createPolicy).toContain('eligibleQuantity > 0');
  });

  it('preserves refund amount, deduction and reason guards', () => {
    expect(createPolicy).toContain('Math.abs(refundTotal - channelTotal) > 0.005');
    expect(createPolicy).toContain("return 'ยอดช่องทางคืนเงินต้องเท่ากับยอดคืนจริง'");
    expect(createPolicy).toContain('Math.max(0, eligibleTotal - refundTotal)');
    expect(createPolicy).toContain("return 'กรุณาระบุเหตุผลเมื่อคืนเงินไม่เต็มจำนวน'");
    expect(createPage).toContain('validateSaleReturnSubmission({');
  });

  it('preserves completion workflow and credit-note routing', () => {
    expect(createPage).toContain('runCompleteSaleReturn({');
    expect(createPage).toContain('issueCreditNoteForSaleReturn({');
    expect(createPage).toContain("code === 'TAX_CREDIT_NOTE_ORIGINAL_DOCUMENT_NOT_FOUND'");
    expect(createPage).toContain('/pos/sales/credit-note/print/${taxDocumentId}?branchId=${completedReturn.branchId}');
    expect(createPolicy).toContain('isFullRefundReturn');
    expect(completeWorkflow).toContain('completeSaleReturn');
  });

  it('preserves module-owned help and canonical API authority', () => {
    for (const source of [searchPage, createPage]) {
      expect(source).toContain('SaleReturnHelpDrawer');
      expect(source).toContain('คู่มือ');
    }
    expect(api).toContain('getReturnableSales');
    expect(api).toContain('getSaleReturnEligibility');
    expect(api).toContain('issueCreditNoteForSaleReturn');
  });

  it('keeps pages as runtime orchestrators and workspaces as presentation owners', () => {
    expect(searchPage).toContain('SaleReturnSearchWorkspace');
    expect(createPage).toContain('SaleReturnCreateWorkspace');
    expect(searchPage).not.toContain('<table');
    expect(createPage).not.toContain('<table');
    expect(searchWorkspace).toContain('<table');
    expect(createWorkspace).toContain('<table');
  });
});
