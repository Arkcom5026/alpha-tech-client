const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const round2 = (value) => Math.round(toNumber(value) * 100) / 100;

export const buildReplacementPrintableItems = (authority) => (
  (Array.isArray(authority?.lines) ? authority.lines : []).map((line, index) => ({
    id: `replacement-${line?.id || index}`,
    documentLineKey: `replacement-${line?.id || index}`,
    documentPrefix: '',
    documentDescriptionRaw: String(line?.description || '').trim(),
    documentDescription: String(line?.description || '').trim(),
    documentSuffix: '',
    hasDocumentLine: true,
    productName: String(line?.description || '').trim() || 'รายการเอกสาร',
    productModel: '-',
    price: round2(line?.unitAmount ?? line?.unitPrice),
    quantity: toNumber(line?.quantity),
    unit: String(line?.unitName || line?.unit || 'หน่วย').trim() || 'หน่วย',
    discount: 0,
    barcode: '-',
    serialNumber: '-',
    replacementLine: true,
  }))
);
