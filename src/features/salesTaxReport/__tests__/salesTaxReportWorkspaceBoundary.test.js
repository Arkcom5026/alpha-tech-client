import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const featureRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => readFileSync(join(featureRoot, relativePath), 'utf8');

describe('sales tax report workspace boundary', () => {
  it('keeps the list page as a thin workspace adapter', () => {
    const page = read('pages/ListSalesTaxReportPage.jsx');
    expect(page).toContain('SalesTaxReportListWorkspace');
    expect(page).not.toContain('useSalesTaxReportStore');
    expect(page).not.toContain('useEffect');
  });

  it('keeps date/report orchestration in the workspace and print as a dedicated surface', () => {
    const workspace = read('workspaces/SalesTaxReportListWorkspace.jsx');
    const printPage = read('pages/PrintSalesTaxReportPage.jsx');

    expect(workspace).toContain('loadSalesTaxDataAction');
    expect(workspace).toContain('/pos/reports/sales-tax/print?startDate=');
    expect(printPage).toContain('PrintSalesTaxReport');
  });
});
