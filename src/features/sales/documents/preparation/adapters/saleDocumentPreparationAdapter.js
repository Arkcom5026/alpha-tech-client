const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const round2 = (value) => Math.round(toNumber(value) * 100) / 100;

export const buildPreparationSeedLines = (saleItems = []) => (
  (Array.isArray(saleItems) ? saleItems : []).map((item) => ({
    description: String(item?.documentDescription || item?.productName || '').trim() || 'รายการเอกสาร',
    quantity: Math.max(toNumber(item?.quantity), 1),
    unitName: String(item?.unit || 'ชิ้น').trim() || 'ชิ้น',
    unitPrice: round2(item?.price),
  }))
);

export const buildPreparationPrintableItems = (preparation) => (
  (Array.isArray(preparation?.lines) ? preparation.lines : []).map((line, index) => ({
    id: `preparation-${line?.id || index}`,
    documentLineKey: `preparation-${line?.id || index}`,
    documentPrefix: '',
    documentDescriptionRaw: String(line?.description || '').trim(),
    documentDescription: String(line?.description || '').trim(),
    documentSuffix: '',
    hasDocumentLine: true,
    productName: String(line?.description || '').trim() || 'รายการเอกสาร',
    productModel: '-',
    price: round2(line?.unitPrice),
    quantity: toNumber(line?.quantity),
    unit: String(line?.unitName || 'หน่วย').trim() || 'หน่วย',
    discount: 0,
    barcode: '-',
    serialNumber: '-',
    preparationLine: true,
  }))
);
