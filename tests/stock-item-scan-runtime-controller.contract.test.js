import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(filename), '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const runtime = read(
  'src/features/stockItem/receive/scan-workflow/hooks/useStockItemScanRuntimeController.js'
);

describe('StockItem scan runtime controller contract', () => {
  it('composes working-group and focus ownership behind one runtime boundary', () => {
    expect(runtime).toContain('useStockItemWorkingGroupController');
    expect(runtime).toContain('useStockItemScanFocusController');
    expect(runtime).toContain('focusForCurrentState');
    expect(runtime).toContain('resolveReceiveInput');
  });

  it('keeps search focus protected through current DOM ownership', () => {
    expect(runtime).toContain('document.activeElement === searchInputRef.current');
    expect(runtime).toContain('searchActive,');
  });

  it('routes serial mode and expected barcode through policy-owned state', () => {
    expect(runtime).toContain('manualSerialMode,');
    expect(runtime).toContain('workingGroup: workingGroupController.workingGroup');
    expect(runtime).toContain('hasExpectedBarcode: Boolean(workingGroupController.expectedBarcode)');
    expect(runtime).toContain('deriveEffectiveReceiveInput');
  });

  it('does not own StockItem receive transport or mutations', () => {
    expect(runtime).not.toContain('/stock-items/');
    expect(runtime).not.toContain('receiveSNAction');
    expect(runtime).not.toContain('receiveStockItemApi');
  });
});
