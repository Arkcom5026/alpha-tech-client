export const normalizeDeliveryNoteDocumentText = (value) => {
  if (typeof value !== 'string') return '';
  return value.trim();
};

export const resolveDeliveryNoteProduct = (item) =>
  item?.product || item?.stockItem?.product || item?.productSnapshot || null;

export const resolveDeliveryNoteProductName = (item) => {
  const product = resolveDeliveryNoteProduct(item);
  return product?.name || item?.productName || item?.name || 'ไม่พบชื่อสินค้า';
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

export const prepareDeliveryNoteSaleItems = (sale) => {
  const source = resolveDeliveryNoteSourceItems(sale);
  if (source.length === 0) return [];

  const grouped = new Map();

  for (const [sourceIndex, item] of source.entries()) {
    const product = resolveDeliveryNoteProduct(item);
    const productIdRaw = product?.id ?? item?.productId ?? item?.stockItem?.productId ?? null;
    const productId = productIdRaw == null ? null : String(productIdRaw);
    const documentLine = buildDeliveryNoteDocumentLine({ ...item, product });
    const key = [
      productId ? `product-${productId}` : `unknown-${item?.id ?? sourceIndex}`,
      `prefix-${documentLine.documentPrefix}`,
      `description-${documentLine.documentDescription}`,
      `suffix-${documentLine.documentSuffix}`,
    ].join('|');
    const isSnItem = Boolean(item?.stockItemId || item?.stockItem?.id);
    const unitPrice = isSnItem
      ? Number(item?.price ?? item?.unitPrice ?? item?.basePrice ?? 0) || 0
      : Number(item?.unitPrice ?? item?.price ?? item?.basePrice ?? item?.sellPrice ?? 0) || 0;
    const quantity = isSnItem ? 1 : Math.max(1, Number(item?.quantity ?? item?.qty ?? 1) || 1);
    const discountEach = isSnItem
      ? 0
      : Number(item?.discount ?? item?.discountAmount ?? 0) || 0;

    if (!grouped.has(key)) {
      const stableId = productId
        ? `product-${productId}-${grouped.size}`
        : `unknown-${item?.id ?? sourceIndex}`;

      grouped.set(key, {
        id: stableId,
        documentLineKey: key,
        productId: productIdRaw,
        stockItemId: item?.stockItemId ?? item?.stockItem?.id ?? null,
        saleItemIds: isSnItem && item?.id ? [Number(item.id)] : [],
        simpleItemIds: !isSnItem && item?.id ? [Number(item.id)] : [],
        documentPrefix: documentLine.documentPrefix,
        documentDescriptionRaw: documentLine.documentDescriptionRaw,
        documentDescription: documentLine.documentDescription,
        documentSuffix: documentLine.documentSuffix,
        hasDocumentLine: Boolean(documentLine.documentPrefix || documentLine.documentSuffix),
        productName: buildDeliveryNotePrintableProductName(documentLine),
        productModel: product?.model || item?.productModel || '-',
        price: unitPrice,
        quantity: 0,
        unit: product?.unit?.name || item?.unit || 'ชิ้น',
        discount: 0,
        barcode: '-',
        serialNumber: '-',
      });
    } else {
      const aggregate = grouped.get(key);
      if (isSnItem && item?.id) aggregate.saleItemIds.push(Number(item.id));
      if (!isSnItem && item?.id) aggregate.simpleItemIds.push(Number(item.id));
    }

    const aggregate = grouped.get(key);
    aggregate.quantity += quantity;
    aggregate.discount += discountEach;
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
