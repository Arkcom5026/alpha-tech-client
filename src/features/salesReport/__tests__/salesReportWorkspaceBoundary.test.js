import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const featureRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => readFileSync(join(featureRoot, relativePath), 'utf8');

describe('sales report workspace boundary', () => {
  it('keeps route-facing pages as thin workspace adapters', () => {
    const pages = [
      ['pages/SalesDashboardPage.jsx', 'SalesDashboardWorkspace'],
      ['pages/SalesListPage.jsx', 'SalesListWorkspace'],
      ['pages/SalesDetailPage.jsx', 'SalesDetailWorkspace'],
      ['pages/ProductPerformancePage.jsx', 'ProductPerformanceWorkspace'],
    ];

    for (const [path, workspaceName] of pages) {
      const source = read(path);
      expect(source).toContain(workspaceName);
      expect(source).not.toContain('useEffect');
      expect(source).not.toContain('useSalesReportStore');
    }
  });

  it('keeps report orchestration inside workspaces', () => {
    expect(read('workspaces/SalesDashboardWorkspace.jsx')).toContain('fetchDashboardAction');
    expect(read('workspaces/SalesListWorkspace.jsx')).toContain('fetchSalesListAction');
    expect(read('workspaces/SalesDetailWorkspace.jsx')).toContain('fetchSalesDetailAction');
    expect(read('workspaces/ProductPerformanceWorkspace.jsx')).toContain('fetchProductPerformanceAction');
  });
});
