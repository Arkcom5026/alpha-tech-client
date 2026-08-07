import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (relativePath) =>
  fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('ready-to-sell scanner page runtime cutover contract', () => {
  const page = read('src/features/product/pages/ReadyToSellStructuredDetailsPage.jsx');
  const controls = read(
    'src/features/product/ready-to-sell/workspace/components/ReadyToSellScanControls.jsx',
  );
  const results = read(
    'src/features/product/ready-to-sell/workspace/components/ReadyToSellResultsTable.jsx',
  );

  it('composes the scanner controller as the runtime owner', () => {
    expect(page).toContain('useReadyToSellScannerController');
    expect(page).toContain('rows: items');
    expect(page).toContain('branchId');
    expect(page).toContain('productId: pid');
  });

  it('uses controller state and intents for scan and sort flow', () => {
    expect(page).toContain('scanInputRef');
    expect(page).toContain('handleScanEnter');
    expect(page).toContain('toggleScanMode');
    expect(page).toContain('toggleSortMode');
    expect(page).toContain('displayRows: displayItems');
  });

  it('does not duplicate scanner matching or focus implementation in the page', () => {
    expect(page).not.toContain('normalizeScan');
    expect(page).not.toContain('tryScanJump');
    expect(page).not.toContain('scanRef.current.focus()');
    expect(page).not.toContain("replace(/[^0-9]+/g, '')");
    expect(page).not.toContain('scrollIntoView({ behavior:');
  });

  it('keeps product loading and reset ownership in the page', () => {
    expect(page).toContain('fetchReadyToSellStructuredDetailsAction');
    expect(page).toContain('resetReadyToSellStructuredDetailsAction');
    expect(page).toContain("setTimeout(() => setCommitted(searchText.trim()), 250)");
  });

  it('preserves the scanner presentation through workspace presentation owners', () => {
    expect(page).toContain('<ReadyToSellScanControls');
    expect(page).toContain('<ReadyToSellResultsTable');
    expect(controls).toContain('สแกน SN/Barcode แล้วกด Enter');
    expect(controls).toContain("sortMode === 'FIFO' ? 'FIFO (เก่าก่อน)' : 'ใหม่ก่อน'");
    expect(results).toContain('highlightId != null && item?.id === highlightId');
    expect(results).toContain("highlighted ? 'bg-amber-50 ring-1 ring-amber-200");
  });
});
