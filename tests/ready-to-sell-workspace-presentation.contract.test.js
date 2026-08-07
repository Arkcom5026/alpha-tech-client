import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (relativePath) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('ready-to-sell workspace presentation contract', () => {
  const page = read('src/features/product/pages/ReadyToSellStructuredDetailsPage.jsx');
  const header = read('src/features/product/ready-to-sell/workspace/components/ReadyToSellWorkspaceHeader.jsx');
  const summary = read('src/features/product/ready-to-sell/workspace/components/ReadyToSellProductSummary.jsx');
  const controls = read('src/features/product/ready-to-sell/workspace/components/ReadyToSellScanControls.jsx');
  const status = read('src/features/product/ready-to-sell/workspace/components/ReadyToSellStatusMessages.jsx');
  const results = read('src/features/product/ready-to-sell/workspace/components/ReadyToSellResultsTable.jsx');

  it('composes presentation slices from the page', () => {
    expect(page).toContain('<ReadyToSellWorkspaceHeader');
    expect(page).toContain('<ReadyToSellProductSummary');
    expect(page).toContain('<ReadyToSellScanControls');
    expect(page).toContain('<ReadyToSellStatusMessages');
    expect(page).toContain('<ReadyToSellResultsTable');
  });

  it('keeps scanner behavior behind controller intents', () => {
    expect(page).toContain('useReadyToSellScannerController');
    expect(page).toContain('onScanEnter={handleScanEnter}');
    expect(page).toContain('onToggleScanMode={toggleScanMode}');
    expect(page).toContain('onToggleSortMode={toggleSortMode}');
    expect(controls).not.toContain('scrollIntoView');
    expect(controls).not.toContain('replace(/[^0-9]+/g');
  });

  it('keeps product data lifecycle in the page', () => {
    expect(page).toContain('fetchReadyToSellStructuredDetailsAction');
    expect(page).toContain('resetReadyToSellStructuredDetailsAction');
    expect(page).toContain('setTimeout(() => setCommitted(searchText.trim()), 250)');
  });

  it('keeps presentation read-only and operationally accessible', () => {
    expect(header).toContain('min-h-11');
    expect(controls).toContain('type="search"');
    expect(controls).toContain('min-h-11');
    expect(status).toContain('role="alert"');
    expect(results).toContain('SN / Barcode');
    expect(results).toContain('onCopyCode(code)');
    expect([header, summary, controls, status, results].join('\n')).not.toMatch(/receiveSNAction|createStockItem|updateStockItem|deleteStockItem/);
  });
});
