import { describe, expect, it } from 'vitest';
import {
  STOCK_ITEM_FOCUS_TARGET,
  STOCK_ITEM_WORKING_GROUP,
  classifyStockItemWorkingGroup,
  deriveEffectiveReceiveInput,
  deriveStockItemFocusTarget,
  resolveExpectedBarcode,
} from '../src/features/stockItem/receive/scan-workflow/policies/stockItemScanWorkflowPolicy';

describe('StockItem scan workflow behavior contract', () => {
  it('classifies empty, single-product, and mixed working groups deterministically', () => {
    expect(classifyStockItemWorkingGroup([])).toBe(STOCK_ITEM_WORKING_GROUP.EMPTY);

    expect(classifyStockItemWorkingGroup([
      { productId: 10, barcode: 'A' },
      { productId: 10, barcode: 'B' },
    ])).toBe(STOCK_ITEM_WORKING_GROUP.SINGLE_PRODUCT);

    expect(classifyStockItemWorkingGroup([
      { productId: 10, barcode: 'A' },
      { productId: 11, barcode: 'B' },
    ])).toBe(STOCK_ITEM_WORKING_GROUP.MIXED_PRODUCT);
  });

  it('preserves the original single-group expected-barcode behavior for serial capture', () => {
    const rows = [
      { productId: 10, barcode: 'BC-001' },
      { productId: 10, barcode: 'BC-002' },
    ];

    const workingGroup = classifyStockItemWorkingGroup(rows);
    const expectedBarcode = resolveExpectedBarcode(rows);

    expect(workingGroup).toBe(STOCK_ITEM_WORKING_GROUP.SINGLE_PRODUCT);
    expect(expectedBarcode).toBe('BC-001');
    expect(deriveStockItemFocusTarget({
      manualSerialMode: true,
      workingGroup,
      hasExpectedBarcode: Boolean(expectedBarcode),
    })).toBe(STOCK_ITEM_FOCUS_TARGET.SERIAL);

    expect(deriveEffectiveReceiveInput({
      barcodeInput: '',
      expectedBarcode,
      serialNumber: ' SN-001 ',
    })).toEqual({ barcode: 'BC-001', serialNumber: 'SN-001' });
  });

  it('keeps mixed groups barcode-led even when serial mode is enabled', () => {
    expect(deriveStockItemFocusTarget({
      manualSerialMode: true,
      workingGroup: STOCK_ITEM_WORKING_GROUP.MIXED_PRODUCT,
      hasExpectedBarcode: true,
      barcodeCaptured: false,
    })).toBe(STOCK_ITEM_FOCUS_TARGET.BARCODE);

    expect(deriveStockItemFocusTarget({
      manualSerialMode: true,
      workingGroup: STOCK_ITEM_WORKING_GROUP.MIXED_PRODUCT,
      hasExpectedBarcode: true,
      barcodeCaptured: true,
    })).toBe(STOCK_ITEM_FOCUS_TARGET.SERIAL);
  });

  it('treats search and edit-serial interactions as protected focus boundaries', () => {
    expect(deriveStockItemFocusTarget({ searchActive: true })).toBe(STOCK_ITEM_FOCUS_TARGET.SEARCH);
    expect(deriveStockItemFocusTarget({ editingSerial: true })).toBe(STOCK_ITEM_FOCUS_TARGET.EDIT_SERIAL);
    expect(deriveStockItemFocusTarget({ submitting: true })).toBe(STOCK_ITEM_FOCUS_TARGET.NONE);
  });

  it('keeps serial optional in the effective receive input', () => {
    expect(deriveEffectiveReceiveInput({
      barcodeInput: ' BC-100 ',
      expectedBarcode: 'BC-FALLBACK',
      serialNumber: '',
    })).toEqual({ barcode: 'BC-100', serialNumber: null });
  });
});
