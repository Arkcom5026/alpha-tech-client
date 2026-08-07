export const STOCK_ITEM_WORKING_GROUP = Object.freeze({
  EMPTY: 'EMPTY',
  SINGLE_PRODUCT: 'SINGLE_PRODUCT',
  MIXED_PRODUCT: 'MIXED_PRODUCT',
});

export const STOCK_ITEM_FOCUS_TARGET = Object.freeze({
  NONE: 'NONE',
  SEARCH: 'SEARCH',
  BARCODE: 'BARCODE',
  SERIAL: 'SERIAL',
  EDIT_SERIAL: 'EDIT_SERIAL',
});

export const classifyStockItemWorkingGroup = (rows = [], resolveProductIdentity) => {
  const list = Array.isArray(rows) ? rows : [];
  if (list.length === 0) return STOCK_ITEM_WORKING_GROUP.EMPTY;

  const resolve = typeof resolveProductIdentity === 'function'
    ? resolveProductIdentity
    : (row) => row?.productId ?? row?.product?.id ?? row?.productName ?? null;

  const identities = list.map((row) => String(resolve(row) ?? '').trim()).filter(Boolean);
  if (identities.length !== list.length) return STOCK_ITEM_WORKING_GROUP.MIXED_PRODUCT;

  const first = identities[0];
  return identities.every((identity) => identity === first)
    ? STOCK_ITEM_WORKING_GROUP.SINGLE_PRODUCT
    : STOCK_ITEM_WORKING_GROUP.MIXED_PRODUCT;
};

export const resolveExpectedBarcode = (rows = []) => {
  const first = Array.isArray(rows) ? rows[0] : null;
  return String(first?.barcode || '').trim();
};

export const deriveStockItemFocusTarget = ({
  searchActive = false,
  editingSerial = false,
  submitting = false,
  manualSerialMode = false,
  workingGroup = STOCK_ITEM_WORKING_GROUP.EMPTY,
  hasExpectedBarcode = false,
  barcodeCaptured = false,
} = {}) => {
  if (searchActive) return STOCK_ITEM_FOCUS_TARGET.SEARCH;
  if (editingSerial) return STOCK_ITEM_FOCUS_TARGET.EDIT_SERIAL;
  if (submitting) return STOCK_ITEM_FOCUS_TARGET.NONE;

  const canUseSerialOnlyFlow =
    manualSerialMode &&
    workingGroup === STOCK_ITEM_WORKING_GROUP.SINGLE_PRODUCT &&
    hasExpectedBarcode;

  if (canUseSerialOnlyFlow || (manualSerialMode && barcodeCaptured)) {
    return STOCK_ITEM_FOCUS_TARGET.SERIAL;
  }

  return STOCK_ITEM_FOCUS_TARGET.BARCODE;
};

export const deriveEffectiveReceiveInput = ({
  barcodeInput,
  expectedBarcode,
  serialNumber,
} = {}) => ({
  barcode: String(barcodeInput || expectedBarcode || '').trim(),
  serialNumber: String(serialNumber || '').trim() || null,
});
