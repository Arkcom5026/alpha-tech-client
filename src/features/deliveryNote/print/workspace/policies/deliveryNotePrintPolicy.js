export const normalizeDeliveryNoteDocumentText = (value) => {
  if (typeof value !== 'string') return '';
  return value.trim();
};

const round2 = (value) => Math.round((Number(value) || 0) * 100) / 100;

const toMoney = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const resolveDeliveryNoteProduct = (item) =>
  item?.product || item?.stockItem?.product || item?.productSnapshot || null;

export const resolveDeliveryNoteProductName = (item) => {
  const product = resolveDeliveryNoteProduct(item);
  return product?.name || item?.description || item?.productName || item?.name || 'ไม่พบชื่อสินค้า';
};

export const buildDeliveryNoteDocumentLine = (item) => {
  const documentDescriptionRaw = normalizeDeliveryNoteDocumentText(item?.documentDescription);

  return {
    documentPrefix: normalizeDeliveryNoteDocumentText(item?.documentPrefix),
    documentDescriptionRaw,
    documentDescription: documentDescriptionRaw || resolveDeliveryNoteProductName(item),
    documentSuffix: normalizeDeliveryNoteDocumentText(item?.documentSuffix),
  };
};

export const buildDeliveryNotePrintableProductName = (documentLine) =>
  [
    documentLine?.documentPrefix,
    documentLine?.documentDescription,
    documentLine?.documentSuffix,
  ]
    .map((value) => normalizeDeliveryNoteDocumentText(value))
    .filter(Boolean)
    .join('\n');

export const resolveDeliveryNoteSourceItems = (sale) => {
  if (!sale) return [];

  if (Array.isArray(sale.saleLines) && sale.saleLines.length > 0) {
    return sale.saleLines;
  }

  return [
    ...(Array.isArray(sale.items) ? sale.items : []),
    ...(Array.isArray(sale.simpleItems) ? sale.simpleItems : []),
  ];
};

const resolveDeliveryNoteLinePricing = (item) => {
  const isSnItem = Boolean(item?.stockItemId || item?.stockItem?.id || item?.lineType === 'STOCK_ITEM');
  const quantity = isSnItem ? 1 : Math.max(1, toMoney(item?.quantity ?? item?.qty ?? 1) || 1);

  // SaleItem.price / SaleItemSimple.price are persisted as the final WHOLE-LINE
  // amount after signed price adjustment. The document workspace must therefore
  // derive the unit price from the final line amount and must not subtract the
  // persisted discount again.
  const explicitLineAmount = item?.lineAmount ?? item?.amount ?? item?.totalAmount ?? null;
  const persistedFinalLineAmount = item?.price != null && item?.basePrice != null
    ? item.price
    : null;

  if (explicitLineAmount != null || persistedFinalLineAmount != null) {
    const lineAmount = round2(toMoney(explicitLineAmount ?? persistedFinalLineAmount));
    const unitPrice = quantity > 0 ? round2(lineAmount / quantity) : 0;
    return {
      isSnItem,
      quantity,
      unitPrice,
      lineAmount,
      discount: 0,
    };
  }

  // Compatibility for older projections that expose a unit price plus a
  // discount rather than a persisted final line amount.
  const rawUnit = toMoney(item?.unitAmount ?? item?.unitPrice ?? item?.sellPrice ?? item?.price ?? item?.basePrice ?? 0);
  const rawDiscount = toMoney(item?.discountAmount ?? item?.discount ?? 0);
  const unitPrice = round2(Math.max(rawUnit - rawDiscount, 0));
  const lineAmount = round2(unitPrice * quantity);

  return {
    isSnItem,
    quantity,
    unitPrice,
    lineAmount,
    discount: 0,
  };
};

export const prepareDeliveryNoteSaleItems = (sale) => {
  const source = resolveDeliveryNoteSourceItems(sale);
  if (source.length === 0) return [];

  const grouped = new Map();

  for (const [sourceIndex, item] of source.entries()) {
    const product = resolveDeliveryNoteProduct(item);
    const productIdRaw = product?.id ?? item?.productId ?? item?.stockItem?.productId ?? null;
    const productId = productIdRaw == null ? null : String(productIdRaw);
    const documentLine = buildDeliveryNoteDocumentLine({ ...item, product });
    const pricing = resolveDeliveryNoteLinePricing(item);
    const unitPriceKey = Math.round(pricing.unitPrice * 100);
    const key = [
      productId ? `product-${productId}` : `unknown-${item?.id ?? sourceIndex}`,
      `unit-${unitPriceKey}`,
      `prefix-${documentLine.documentPrefix}`,
      `description-${documentLine.documentDescription}`,
      `suffix-${documentLine.documentSuffix}`,
    ].join('|');

    if (!grouped.has(key)) {
      const stableId = productId
        ? `product-${productId}-${grouped.size}`
        : `unknown-${item?.id ?? sourceIndex}`;

      grouped.set(key, {
        id: stableId,
        documentLineKey: key,
        productId: productIdRaw,
        stockItemId: item?.stockItemId ?? item?.stockItem?.id ?? null,
        saleItemIds: pricing.isSnItem && item?.id ? [Number(item.id)] : [],
        simpleItemIds: !pricing.isSnItem && item?.id ? [Number(item.id)] : [],
        documentPrefix: documentLine.documentPrefix,
        documentDescriptionRaw: documentLine.documentDescriptionRaw,
        documentDescription: documentLine.documentDescription,
        documentSuffix: documentLine.documentSuffix,
        hasDocumentLine: Boolean(documentLine.documentPrefix || documentLine.documentSuffix),
        productName: buildDeliveryNotePrintableProductName(documentLine),
        productModel: product?.model || item?.productModel || '-',
        price: pricing.unitPrice,
        quantity: 0,
        unit: product?.unit?.name || item?.unit || 'ชิ้น',
        discount: 0,
        barcode: item?.barcode || item?.stockItem?.barcode || '-',
        serialNumber: '-',
      });
    } else {
      const aggregate = grouped.get(key);
      if (pricing.isSnItem && item?.id) aggregate.saleItemIds.push(Number(item.id));
      if (!pricing.isSnItem && item?.id) aggregate.simpleItemIds.push(Number(item.id));
    }

    const aggregate = grouped.get(key);
    aggregate.quantity = round2(aggregate.quantity + pricing.quantity);
  }

  return Array.from(grouped.values());
};

export const buildDeliveryNoteBranchAddress = (branch = {}) => {
  const subdistrict = branch?.subdistrict || null;
  const district = subdistrict?.district || null;
  const province = district?.province || null;

  const fullAddress = [
    branch?.address,
    subdistrict?.nameTh ? `ต.${subdistrict.nameTh}` : null,
    district?.nameTh ? `อ.${district.nameTh}` : null,
    province?.nameTh ? `จ.${province.nameTh}` : null,
    subdistrict?.postcode,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  return fullAddress || '-';
};

export const buildDeliveryNoteBranchConfig = (sale) => {
  const branch = sale?.branch || {};

  return {
    branchName: branch.companyName || branch.name || '-',
    address: buildDeliveryNoteBranchAddress(branch),
    phone: branch.phone || '-',
    taxId: branch.taxId || sale?.branchTaxId || '-',
  };
};
