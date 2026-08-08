import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('sale return workspace behavior contract', () => {
  const searchPage = read('src/features/saleReturn/pages/ReturnSearchPage.jsx');
  const searchWorkspace = read('src/features/saleReturn/search/ReturnSearchWorkspace.jsx');
  const searchPolicy = read('src/features/saleReturn/search/filterReturnableSales.js');
  const createPage = read('src/features/saleReturn/pages/CreateReturnPage.jsx');
  const createWorkspace = read('src/features/saleReturn/create/CreateReturnWorkspace.jsx');
  const returnForm = read('src/features/saleReturn/components/ReturnForm.jsx');
  const store = read('src/features/saleReturn/store/saleReturnStore.js');
  const api = read('src/features/saleReturn/api/saleReturnApi.js');

  it('preserves returnable-sale loading and search semantics', () => {
    expect(searchPage).toContain('loadReturnableSalesAction();');
    expect(searchPage).toContain('filterReturnableSales(returnableSales, { search, fromDate, toDate })');
    expect(searchPolicy).toContain('(sale.code?.toLowerCase().includes(query) ?? false)');
    expect(searchPolicy).toContain('(sale.customer?.companyName?.toLowerCase().includes(query) ?? false)');
    expect(searchPolicy).toContain('(sale.customer?.name?.toLowerCase().includes(query) ?? false)');
    expect(searchPolicy).toContain('(sale.customer?.phone?.includes(query) ?? false)');
    expect(searchPolicy).toContain('new Date(fromDate) <= soldDate');
    expect(searchPolicy).toContain('soldDate <= new Date(toDate)');
  });

  it('preserves navigation into create-return flow', () => {
    expect(searchPage).toContain('navigate(`/pos/sales/sale-return/create/${saleId}`)');
    expect(searchWorkspace).toContain('onCreateReturn(sale.id)');
    expect(createPage).toContain('const { saleId } = useParams();');
    expect(createPage).toContain('getSaleByIdAction(saleId);');
  });

  it('preserves selected-item payload and submit guard', () => {
    expect(returnForm).toContain('if (selected.length === 0) return;');
    expect(returnForm).toContain('reason,');
    expect(returnForm).toContain('items: selected.map((item) => ({ saleItemId: item.id }))');
    expect(returnForm).toContain('onSubmit(payload);');
    expect(createPage).toContain('createSaleReturnAction(saleId, payload)');
    expect(createWorkspace).toContain('<ReturnForm items={sale.items} sale={sale} onSubmit={onSubmit} />');
  });

  it('preserves sale-return API contracts', () => {
    expect(api).toContain('apiClient.post(`/sale-returns/create`');
    expect(api).toContain('saleId,');
    expect(api).toContain('apiClient.get(`/sale-returns`)');
    expect(api).toContain('apiClient.get(`/sale-returns/${saleReturnId}`)');
  });

  it('preserves current cross-domain sale read authority without modifying it', () => {
    expect(store).toContain("import { getSaleReturns } from '@/features/sales/api/saleApi';");
    expect(store).toContain('const data = await getSaleReturns();');
    expect(createPage).toContain("import useSaleStore from '../../sales/store/salesStore';");
  });

  it('keeps route pages thin and delegates presentation to workspace boundaries', () => {
    expect(searchPage).toContain("import ReturnSearchWorkspace from '../search/ReturnSearchWorkspace';");
    expect(searchPage).toContain('<ReturnSearchWorkspace');
    expect(searchPage).not.toContain('<table');
    expect(createPage).toContain("import CreateReturnWorkspace from '../create/CreateReturnWorkspace';");
    expect(createPage).toContain('<CreateReturnWorkspace');
    expect(createPage).not.toContain('<ReturnForm');
    expect(searchWorkspace).toContain('<table');
    expect(createWorkspace).toContain('<ReturnForm');
  });
});
