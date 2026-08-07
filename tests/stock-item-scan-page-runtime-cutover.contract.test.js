import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(filename), '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const page = read('src/features/stockItem/pages/ScanBarcodeListPage.jsx');
const runtime = read(
  'src/features/stockItem/receive/scan-workflow/hooks/useStockItemScanRuntimeController.js'
);

describe('StockItem scan page runtime cutover contract', () => {
  it('cuts the page over to the scan runtime controller', () => {
    expect(page).toContain('useStockItemScanRuntimeController');
    expect(page).toContain('workingRows: pendingList');
    expect(page).toContain('workingGroup,');
    expect(page).toContain('expectedBarcode: currentExpectedPlaceholder');
    expect(page).toContain('resolveReceiveInput,');
  });

  it('restores optional serial mode without making serial mandatory', () => {
    expect(page).toContain('manualSerialMode');
    expect(page).toContain('เก็บ Serial Number');
    expect(page).toContain('checked={manualSerialMode}');
    expect(page).toContain('disabled={submitting || !manualSerialMode}');
    expect(page).toContain('ไม่บังคับ');
  });

  it('preserves single-group serial autopilot and mixed-group barcode leadership', () => {
    expect(page).toContain('isSingleProductWorkingGroup');
    expect(page).toContain('focusForCurrentState({ barcodeCaptured: true })');
    expect(page).toContain('scheduleFocus(STOCK_ITEM_FOCUS_TARGET.SERIAL)');
    expect(runtime).toContain("workingGroupController.workingGroup === STOCK_ITEM_WORKING_GROUP.SINGLE_PRODUCT");
    expect(runtime).toContain("expectedBarcode: canUseExpectedBarcode ? workingGroupController.expectedBarcode : ''");
  });

  it('keeps search and edit serial inside protected focus ownership', () => {
    expect(page).toContain('searchInputRef: filterInputRef');
    expect(page).toContain('editSerialInputRef');
    expect(page).toContain('ref={editSerialInputRef}');
    expect(page).toContain('type="search"');
  });

  it('does not restore a page-local barcode focus scheduler', () => {
    expect(page).not.toContain('const focusBarcodeInput = useCallback');
    expect(page).not.toContain('barcodeInputRef.current?.focus?.()');
    expect(page).toContain('scheduleFocus(STOCK_ITEM_FOCUS_TARGET.BARCODE)');
  });
});
