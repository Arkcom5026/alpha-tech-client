import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(filename), '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const page = read('src/features/stockItem/pages/ScanBarcodeListPage.jsx');
const controls = read(
  'src/features/stockItem/receive/scan-workflow/components/StockItemScanControls.jsx'
);
const workingResults = read(
  'src/features/stockItem/receive/scan-workflow/components/StockItemWorkingGroupResults.jsx'
);
const receivedResults = read(
  'src/features/stockItem/receive/scan-workflow/components/StockItemReceivedResults.jsx'
);
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

  it('restores optional serial mode through the composed scan controls', () => {
    expect(page).toContain('<StockItemScanControls');
    expect(page).toContain('manualSerialMode={manualSerialMode}');
    expect(page).toContain('onSerialModeChange={handleSerialModeChange}');
    expect(page).toContain('serialInputRef={serialInputRef}');
    expect(page).toContain('snInput={snInput}');

    expect(controls).toContain('เก็บ Serial Number');
    expect(controls).toContain('checked={manualSerialMode}');
    expect(controls).toContain('disabled={submitting || !manualSerialMode}');
    expect(controls).toContain('ไม่บังคับ');
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
    expect(page).toContain('filterInputRef={filterInputRef}');
    expect(page).toContain('editSerialInputRef={editSerialInputRef}');
    expect(page).toContain('scheduleFocus(STOCK_ITEM_FOCUS_TARGET.EDIT_SERIAL)');
    expect(workingResults).toContain('type="search"');
    expect(workingResults).toContain('ref={filterInputRef}');
    expect(receivedResults).toContain('ref={editSerialInputRef}');
  });

  it('does not restore a page-local barcode focus scheduler', () => {
    expect(page).not.toContain('const focusBarcodeInput = useCallback');
    expect(page).not.toContain('barcodeInputRef.current?.focus?.()');
    expect(page).toContain('scheduleFocus(STOCK_ITEM_FOCUS_TARGET.BARCODE)');
    expect(workingResults).not.toContain('.focus(');
    expect(receivedResults).not.toContain('.focus(');
  });
});
