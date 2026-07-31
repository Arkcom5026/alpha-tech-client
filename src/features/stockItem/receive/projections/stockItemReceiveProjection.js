export const projectStockItemReceiveCommand = (input, maybeSerialNumber) => {
  const isObjectInput = typeof input === 'object' && input !== null;
  const nestedBarcode = isObjectInput ? input.barcode : null;

  const barcode = (() => {
    if (nestedBarcode && typeof nestedBarcode === 'object') {
      return String(nestedBarcode.barcode || '').trim();
    }
    if (isObjectInput) return String(input.barcode || '').trim();
    return String(input || '').trim();
  })();

  if (!barcode) throw new Error('Missing barcode');

  const serialNumber = (() => {
    if (nestedBarcode && typeof nestedBarcode === 'object') {
      return String(nestedBarcode.serialNumber ?? '').trim();
    }
    if (isObjectInput) return String(input.serialNumber ?? '').trim();
    return String(maybeSerialNumber ?? '').trim();
  })();

  const keepSN = Boolean(
    (nestedBarcode && typeof nestedBarcode === 'object' && nestedBarcode.keepSN === true) ||
      (isObjectInput && input.keepSN === true)
  );

  const payload =
    keepSN || serialNumber
      ? {
          barcode: {
            barcode,
            ...(serialNumber ? { serialNumber } : {}),
          },
          keepSN,
        }
      : { barcode };

  return { barcode, serialNumber, keepSN, payload };
};

export const projectStockItemReceiveResult = (sourceResponse) => ({
  stockItem: sourceResponse?.stockItem ?? sourceResponse ?? null,
  sourceResponse,
});
