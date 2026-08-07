import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(filename), '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const queueController = read('src/features/receiving/quick-stock/hooks/useQuickStockQueueController.js');
const runtimeController = read('src/features/receiving/quick-stock/hooks/useQuickStockRuntimeController.js');
const page = read('src/features/receiving/quick-stock/pages/QuickStockPage.jsx');
const queueTable = read('src/features/receiving/components/quick-stock/IntakeQueueTable.jsx');
const queueBody = read('src/features/receiving/components/quick-stock/QueueTableBody.jsx');
const queueRow = read('src/features/receiving/components/quick-stock/QueueRow.jsx');

describe('quick stock auto focus flow contract', () => {
  it('keeps focus scheduling owned by the queue controller', () => {
    expect(queueController).toContain('const scheduleFocus = useCallback');
    expect(queueController).toContain('const focusBarcodeInput = useCallback');
    expect(queueController).toContain('const focusSerialInput = useCallback');
    expect(queueController).toContain('cancelScheduledFocus();');
    expect(queueController).toMatch(/if \(isOperationalSelection\) \{\s*focusBarcodeInput\(\);/);
  });

  it('refocuses when the selected operational product identity changes', () => {
    expect(runtimeController).toContain('operationalSelectionKey: provisionalOperationalProduct?.id || null');
    expect(queueController).toContain('operationalSelectionKey,');
    expect(queueController).toContain('isOperationalSelection, operationalSelectionKey]);');
  });

  it('routes barcode scan according to the serial autofocus preference', () => {
    expect(queueController).toMatch(/if \(autoFocusSerial\) focusSerialInput\(rowId\);\s*else focusBarcodeInput\(\);/);
    expect(queueController).toContain('focusBarcodeInput();\n      return;');
  });

  it('routes serial Enter back through the queue owner instead of focusing across components', () => {
    expect(queueController).toContain('const handleSerialSubmit = useCallback');
    expect(page).toContain('onSerialSubmit={handleSerialSubmit}');
    expect(queueTable).toContain('onSerialSubmit={onSerialSubmit}');
    expect(queueBody).toContain('onSerialSubmit={onSerialSubmit}');
    expect(queueRow).toContain('onSerialSubmit?.(item.id);');
    expect(queueRow).not.toContain('barcodeInputRef');
    expect(queueRow).not.toContain('.focus()');
  });

  it('does not focus disabled controls and cleans pending focus work', () => {
    expect(queueController).toContain('if (!target || target.disabled) return;');
    expect(queueController).toContain('useEffect(() => () => cancelScheduledFocus()');
  });
});
