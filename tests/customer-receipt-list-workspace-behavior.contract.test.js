import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('customer receipt list workspace behavior contract', () => {
  const page = read('src/features/customerReceipt/pages/CustomerReceiptListPage.jsx');
  const workspace = read('src/features/customerReceipt/list/CustomerReceiptListWorkspace.jsx');
  const runtimeSource = `${page}\n${workspace}`;

  it('preserves initial-load-once and message cleanup lifecycle', () => {
    expect(page).toContain('const didInitialLoadRef = useRef(false);');
    expect(page).toContain('if (didInitialLoadRef.current) return;');
    expect(page).toContain('didInitialLoadRef.current = true;');
    expect(page).toContain('searchCustomerReceiptsAction(filters).catch(() => {});');
    expect(page).toContain('clearCustomerReceiptMessagesAction();');
  });

  it('preserves search and reset authority against the receipt store', () => {
    expect(page).toContain('const handleSearch = async () =>');
    expect(page).toContain('keyword: keywordInput');
    expect(page).toContain('page: 1');
    expect(page).toContain('const handleReset = async () =>');
    expect(page).toContain("setKeywordInput('');");
    expect(page).toContain('resetCustomerReceiptFiltersAction();');
    for (const field of ['status', 'customerId', 'paymentMethod', 'fromDate', 'toDate']) {
      expect(page).toContain(`${field}: ''`);
    }
    expect(workspace).toContain("event.key === 'Enter' && onSearch()");
    expect(workspace).toContain('onKeywordInputChange(event.target.value)');
  });

  it('preserves client-side sorting without mutating store rows', () => {
    expect(page).toContain("const [sortKey, setSortKey] = useState('createdAt');");
    expect(page).toContain("const [sortDir, setSortDir] = useState('desc');");
    expect(page).toContain('const toggleSort = (key) =>');
    expect(page).toContain('return [...items].sort((a, b) =>');
    expect(page).toContain("sortKey === 'totalAmount'");
    expect(page).toContain("sortKey === 'allocatedAmount'");
    expect(page).toContain("sortKey === 'remainingAmount'");
    for (const key of ['code', 'customerName', 'totalAmount', 'allocatedAmount', 'remainingAmount', 'createdAt']) {
      expect(workspace).toContain(`onToggleSort('${key}')`);
    }
  });

  it('preserves finance-context navigation and allocation guard', () => {
    expect(page).toContain("currentPath.indexOf('/finance')");
    expect(page).toContain('finance/customer-receipts${segment}');
    expect(page).toContain("getDynamicFinanceUrl('/create')");
    expect(page).toContain('getDynamicFinanceUrl(`/${item.id}`)');
    expect(page).toContain('getDynamicFinanceUrl(`/${item.id}/reprint`)');
    expect(page).toContain('getDynamicFinanceUrl(`/${item.id}/allocate`)');
    expect(workspace).toContain('!isCancelled && remains > 0');
    expect(workspace).toContain('onOpenDetail(item)');
    expect(workspace).toContain('onOpenReprint(item)');
    expect(workspace).toContain('onOpenAllocate(item)');
  });

  it('preserves receipt summary semantics and pagination ownership', () => {
    for (const field of [
      'totalReceipts',
      'totalAmount',
      'totalAllocated',
      'totalRemaining',
      'activeCount',
      'fullyAllocatedCount',
      'cancelledCount',
    ]) {
      expect(runtimeSource).toContain(field);
    }
    expect(page).toContain('pagination');
    expect(page).toContain('setCustomerReceiptFiltersAction');
    expect(page).toContain('searchCustomerReceiptsAction');
  });

  it('keeps page orchestration separate from workspace presentation', () => {
    expect(page).toContain("import CustomerReceiptListWorkspace from '../list/CustomerReceiptListWorkspace';");
    expect(page).toContain('<CustomerReceiptListWorkspace');
    expect(page).not.toContain('<table');
    expect(page).not.toContain('lucide-react');
    expect(workspace).toContain('<table');
    expect(workspace).toContain('data-testid="create-new-receipt-button"');
  });
});
