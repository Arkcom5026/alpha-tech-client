const DEFAULT_GENERATION_ERROR = 'สร้างบาร์โค้ดไม่สำเร็จ';

const toPositiveInteger = (value, fallback = 1) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.trunc(parsed);
};

export const projectBarcodeGenerationOptions = (options = {}) => ({
  dryRun: options?.dryRun === true,
  lotLabelPerLot: toPositiveInteger(options?.lotLabelPerLot, 1),
});

export const projectGeneratedBarcode = (barcode, index = 0) => ({
  ...barcode,
  id: barcode?.id ?? null,
  barcode: String(barcode?.barcode ?? '').trim(),
  kind: barcode?.kind ? String(barcode.kind).toUpperCase() : null,
  printed: Boolean(barcode?.printed),
  qtyLabelsSuggested: toPositiveInteger(barcode?.qtyLabelsSuggested, 1),
  generationIndex: index,
  sourceBarcode: barcode,
});

export const projectBarcodeGenerationResult = (response = {}) => {
  const source = Array.isArray(response) ? response : response?.barcodes;
  const barcodes = Array.isArray(source)
    ? source.map(projectGeneratedBarcode).filter((item) => item.barcode)
    : [];

  return {
    barcodes,
    generatedCount: Number(response?.generatedCount ?? barcodes.length) || 0,
    dryRun: Boolean(response?.dryRun),
    sourceResponse: response,
  };
};

export const projectBarcodeGenerationError = (
  error,
  fallback = DEFAULT_GENERATION_ERROR
) => {
  const backendMessage = error?.response?.data?.error || error?.response?.data?.message;
  if (typeof backendMessage === 'string' && backendMessage.trim()) {
    return backendMessage.trim();
  }

  const message = typeof error?.message === 'string' ? error.message.trim() : '';
  const isGenericHttpMessage = /^request failed with status code \d+$/i.test(message);

  return message && !isGenericHttpMessage ? message : fallback;
};
