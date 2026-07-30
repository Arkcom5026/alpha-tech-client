import { generateReceiptBarcodes } from '../generation';

const normalizeLegacyBarcodeItem = (barcode = {}) => ({
  ...barcode,
  id: barcode?.id ?? null,
  barcode: barcode?.barcode,
  printed: Boolean(barcode?.printed),
  kind: barcode?.kind,
  qtyLabelsSuggested: Number(barcode?.qtyLabelsSuggested ?? 1),
  productName:
    barcode?.productName ??
    barcode?.product?.name ??
    barcode?.stockItem?.product?.name ??
    undefined,
  productSpec:
    barcode?.productSpec ??
    barcode?.product?.spec ??
    barcode?.stockItem?.product?.spec ??
    undefined,
  stockItemId: barcode?.stockItem?.id ?? barcode?.stockItemId ?? null,
  serialNumber: barcode?.stockItem?.serialNumber ?? barcode?.serialNumber ?? null,
  stockItemStatus: String(
    barcode?.stockItem?.status ?? barcode?.stockItemStatus ?? barcode?.status ?? 'IN_STOCK'
  ).toUpperCase() === 'SOLD_OUT'
    ? 'SOLD'
    : String(
        barcode?.stockItem?.status ?? barcode?.stockItemStatus ?? barcode?.status ?? 'IN_STOCK'
      ).toUpperCase() === 'SOLD'
      ? 'SOLD'
      : 'IN_STOCK',
});

export const generateBarcodesForLegacyStore = async ({
  receiptId,
  options = {},
  generate = generateReceiptBarcodes,
} = {}) => {
  const result = await generate({ receiptId, options });
  const rows = Array.isArray(result?.barcodes) ? result.barcodes : [];

  return rows.map((row) => normalizeLegacyBarcodeItem(row?.sourceBarcode ?? row));
};

export const runGenerationForLegacyPrintBatch = async ({
  receiptId,
  options = {},
  generate = generateReceiptBarcodes,
} = {}) => {
  await generate({ receiptId, options });
  return true;
};

export default generateBarcodesForLegacyStore;
