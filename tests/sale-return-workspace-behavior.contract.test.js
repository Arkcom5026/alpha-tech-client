import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('sale return workspace behavior contract', () => {
  const searchPage = read('src/features/saleReturn/pages/ReturnSearchPage.jsx');
  const createPage = read('src/features/saleReturn/pages/CreateReturnPage.jsx');
  const returnForm = read('src/features/saleReturn/components/ReturnForm.jsx');
  const store = read('src/features/saleReturn/store/saleReturnStore.js');
  const api = read('src/features/saleReturn/api/saleReturnApi.js');

  it('preserves returnable-sale loading and search semantics', () => {
    expect(searchPage).toContain('loadReturnableSalesAction();');
    expect(searchPage).toContain('returnableSales.filter((sale) =>');
    expect(searchPage).toContain('sale.code?.toLowerCase().includes(query)');
    expect(searchPage).toContain('sale.customer?.companyName?.toLowerCase().includes(query)');
    expect(searchPage).toContain('sale.customer?.name?.toLowerCase().includes(query)');
    expect(searchPage).toContain('sale.customer?.phone?.includes(query)');
    expect(searchPage).toContain('new Date(fromDate) <= soldDate');
    expect(searchPage).toContain('soldDate <= new Date(toDate)');
  });

  it('preserves navigation into create-return flow', () => {
    expect(searchPage).toContain("navigate(`/pos/sales/sale-return/create/${sale.id}`)");
    expect(createPage).toContain('const { saleId } = useParams();');
    expect(createPage).toContain('getSaleByIdAction(saleId);');
  });

  it('preserves selected-item payload and submit guard', () => {
    expect(returnForm).toContain('if (selected.length === 0) return;');
    expect(returnForm).toContain('reason,');
    expect(returnForm).toContain('items: selected.map((item) => ({ saleItemId: item.id }))');
    expect(returnForm).toContain('onSubmit(payload);');
    expect(createPage).toContain('createSaleReturnAction(saleId, payload)');
  });

  it('preserves sale-return API contracts', () => {
    expect(api).toContain("apiClient.post(`/sale-returns/create`");
    expect(api).toContain('saleId,');
    expect(api).toContain("apiClient.get(`/sale-returns`)");
    expect(api).toContain('apiClient.get(`/sale-returns/${saleReturnId}`)');
  });

  it('preserves current cross-domain sale read authority without modifying it', () => {
    expect(store).toContain("import { getSaleReturns } from '@/features/sales/api/saleApi';");
    expect(store).toContain('const data = await getSaleReturns();');
    expect(createPage).toContain("import useSaleStore from '../../sales/store/salesStore';");
  });
});
