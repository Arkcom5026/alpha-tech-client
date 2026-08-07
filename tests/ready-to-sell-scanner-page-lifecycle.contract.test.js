import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('ready-to-sell scanner page lifecycle contract', () => {
  const page = read('src/features/product/pages/ReadyToSellStructuredDetailsPage.jsx');
  const controls = read(
    'src/features/product/ready-to-sell/workspace/components/ReadyToSellScanControls.jsx',
  );
  const controller = read(
    'src/features/product/ready-to-sell/scan-workflow/hooks/useReadyToSellScannerController.js',
  );

  it('preserves server-search debounce and store cleanup ownership', () => {
    expect(page).toContain('setTimeout(() => setCommitted(searchText.trim()), 250)');
    expect(page).toContain("if (typeof resetAction === 'function') resetAction()");
    expect(page).toContain('fetchReadyToSellStructuredDetailsAction');
  });

  it('delegates scan focus lifecycle to the scanner controller', () => {
    expect(page).toContain('useReadyToSellScannerController({');
    expect(page).toContain('branchId,');
    expect(page).toContain('productId: pid');
    expect(page).toContain('scanInputRef');
    expect(controller).toContain('focusScanInput');
    expect(controller).toContain('if (!scanMode || !branchId || !productId) return;');
    expect(controller).toContain('node.focus()');
  });

  it('delegates Enter-to-scan through workspace controls and clears input in the controller', () => {
    expect(page).toContain('onScanEnter={handleScanEnter}');
    expect(controls).toContain("if (e.key === 'Enter')");
    expect(controls).toContain('onScanEnter();');
    expect(page).toContain('setScanText');
    expect(controller).toContain("setScanText('')");
  });

  it('delegates highlight and fail-soft scrolling to the scanner controller', () => {
    expect(page).toContain('highlightId');
    expect(page).toContain('scanMessage');
    expect(controller).toContain('setHighlightId(outcome.highlightId ?? null)');
    expect(controller).toContain('document.getElementById(`sn-row-${id}`)');
    expect(controller).toContain("el.scrollIntoView({ behavior: 'smooth', block: 'center' });");
    expect(controller).toContain("setScanMessage(outcome.message || '')");
  });

  it('keeps scanner behavior local to this read-only stock-detail surface', () => {
    expect(page).not.toMatch(/receiveSNAction|createStockItem|updateStockItem|deleteStockItem/);
    expect(controls).not.toMatch(/receiveSNAction|createStockItem|updateStockItem|deleteStockItem/);
    expect(controller).not.toMatch(/receiveSNAction|createStockItem|updateStockItem|deleteStockItem/);
  });
});
