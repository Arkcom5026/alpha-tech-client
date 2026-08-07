import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(filename), '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const workingGroupController = read(
  'src/features/stockItem/receive/scan-workflow/hooks/useStockItemWorkingGroupController.js'
);
const focusController = read(
  'src/features/stockItem/receive/scan-workflow/hooks/useStockItemScanFocusController.js'
);
const policy = read(
  'src/features/stockItem/receive/scan-workflow/policies/stockItemScanWorkflowPolicy.js'
);

describe('StockItem scan workflow controller ownership contract', () => {
  it('keeps working-group derivation behind the scan-workflow policy', () => {
    expect(workingGroupController).toContain('classifyStockItemWorkingGroup');
    expect(workingGroupController).toContain('resolveExpectedBarcode');
    expect(workingGroupController).toContain('workingRows');
    expect(workingGroupController).toContain('expectedBarcode');
    expect(workingGroupController).not.toContain('.focus(');
  });

  it('keeps focus scheduling owned by one controller', () => {
    expect(focusController).toContain('const scheduleFocus = useCallback');
    expect(focusController).toContain('const focusForState = useCallback');
    expect(focusController).toContain('cancelScheduledFocus();');
    expect(focusController).toContain('useEffect(() => () => cancelScheduledFocus()');
  });

  it('protects disabled controls and resolves focus through policy state', () => {
    expect(focusController).toContain('if (!element || element.disabled) return;');
    expect(focusController).toContain('deriveStockItemFocusTarget(state)');
    expect(policy).toContain('if (searchActive) return STOCK_ITEM_FOCUS_TARGET.SEARCH;');
    expect(policy).toContain('if (editingSerial) return STOCK_ITEM_FOCUS_TARGET.EDIT_SERIAL;');
    expect(policy).toContain('if (submitting) return STOCK_ITEM_FOCUS_TARGET.NONE;');
  });

  it('keeps search/grouping separate from receive transport ownership', () => {
    expect(workingGroupController).not.toContain('/stock-items/');
    expect(focusController).not.toContain('/stock-items/');
    expect(workingGroupController).not.toContain('receiveSNAction');
    expect(focusController).not.toContain('receiveSNAction');
  });
});
