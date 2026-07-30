const normalizePositiveInt = (value, fallback, max) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(Math.trunc(parsed), 1), max);
};

export const projectReprintSearchParams = (input = {}) => {
  const mode = String(input.mode || 'RC').trim().toUpperCase() === 'PO' ? 'PO' : 'RC';
  const query = String(input.query || '').trim();
  const supplierKeyword = String(input.supplierKeyword || '').trim();

  return {
    mode,
    printed: input.printed !== false,
    limit: normalizePositiveInt(input.limit, 50, 50),
    ...(query ? { query } : {}),
    ...(supplierKeyword ? { supplierKeyword } : {}),
  };
};

export const projectBarcodePrintRows = (response) => {
  const sourceRows = Array.isArray(response?.barcodes)
    ? response.barcodes
    : Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response)
        ? response
        : [];

  return sourceRows.map((barcode, index) => ({
    id: barcode?.id ?? null,
    barcode: String(barcode?.barcode ?? '').trim(),
    kind: String(barcode?.kind ?? '').trim().toUpperCase() || null,
    printed: Boolean(barcode?.printed),
    productName: String(barcode?.productName ?? barcode?.product?.name ?? '').trim(),
    productSpec: String(barcode?.productSpec ?? barcode?.product?.spec ?? '').trim(),
    quantity: normalizePositiveInt(barcode?.qtyLabelsSuggested, 1, 1000),
    sourceIndex: index,
    sourceBarcode: barcode,
  }));
};

export const expandBarcodePrintRows = (rows, { useSuggestedQuantity = true } = {}) => {
  const sourceRows = Array.isArray(rows) ? rows : [];
  return sourceRows.flatMap((row) => {
    const count = useSuggestedQuantity && row?.kind === 'LOT'
      ? normalizePositiveInt(row?.quantity, 1, 1000)
      : 1;

    return Array.from({ length: count }, (_, duplicateIndex) => ({
      ...row,
      duplicateIndex,
    }));
  });
};

export const projectBarcodePrintError = (error, fallback = 'ดำเนินการพิมพ์บาร์โค้ดไม่สำเร็จ') => {
  const backendMessage = String(error?.response?.data?.message ?? error?.response?.data?.error ?? '').trim();
  if (backendMessage) return backendMessage;

  const message = String(error?.message ?? '').trim();
  if (message && !/^Request failed with status code \d+$/i.test(message)) return message;
  return fallback;
};
