const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const round2 = (value) => Number(toNumber(value).toFixed(2));

const normalizeText = (value) => String(value || '').trim();

const sourceItemsByKey = (sale = {}) => {
  const map = new Map();
  for (const item of sale.items || []) map.set(`STOCK:${Number(item.id)}`, item);
  for (const item of sale.simpleItems || []) map.set(`SIMPLE:${Number(item.id)}`, item);
  return map;
};

const persistedRevisionPrintGroupKey = (item, index) => {
  const productId = item?.productId == null ? null : String(item.productId);
  const unitAmountKey = Math.round(round2(item?.price) * 100);
  return [
    productId ? `product-${productId}` : `unknown-${index}`,
    `unit-${unitAmountKey}`,
    `description-${normalizeText(item?.documentDescription)}`,
    `unit-name-${normalizeText(item?.unit)}`,
  ].join('|');
};

export const groupPersistedDeliveryNoteRevisionItems = (items = []) => {
  const grouped = new Map();

  for (const [index, item] of (Array.isArray(items) ? items : []).entries()) {
    const key = persistedRevisionPrintGroupKey(item, index);
    if (!grouped.has(key)) {
      grouped.set(key, {
        ...item,
        id: `delivery-note-revision-group-${grouped.size}`,
        documentLineKey: key,
        saleItemIds: [...(item?.saleItemIds || [])],
        simpleItemIds: [...(item?.simpleItemIds || [])],
        quantity: 0,
        lineAmount: 0,
      });
    } else {
      const aggregate = grouped.get(key);
      aggregate.saleItemIds.push(...(item?.saleItemIds || []));
      aggregate.simpleItemIds.push(...(item?.simpleItemIds || []));
    }

    const aggregate = grouped.get(key);
    aggregate.quantity = round2(aggregate.quantity + round2(item?.quantity));
    aggregate.lineAmount = round2(aggregate.lineAmount + round2(item?.lineAmount));
  }

  return Array.from(grouped.values());
};

export const hasPersistedDeliveryNoteRevision = (authority) => (
  authority?.deliveryNoteReadAuthority?.persistedRevision === true
  && Array.isArray(authority?.lines)
);

export const buildPersistedDeliveryNoteRevisionItems = ({ sale, authority } = {}) => {
  if (!hasPersistedDeliveryNoteRevision(authority)) return [];
  const sources = sourceItemsByKey(sale);

  const revisionItems = authority.lines.map((line, index) => {
    const sourceLineType = String(line?.sourceLineType || '').toUpperCase();
    const sourceLineId = Number(line?.sourceLineId);
    const source = sources.get(`${sourceLineType}:${sourceLineId}`) || {};
    const quantity = round2(line?.activeQuantity);
    const unitAmount = round2(line?.unitAmount);
    const lineAmount = round2(line?.activeAmount);
    const product = source?.product || source?.stockItem?.product || null;

    return {
      id: `delivery-note-revision-${authority?.deliveryNoteReadAuthority?.currentRevisionId || 'current'}-${index}`,
      documentLineKey: `revision:${sourceLineType}:${sourceLineId}`,
      productId: line?.snapshot?.sourceProductId ?? source?.productId ?? source?.stockItem?.productId ?? null,
      stockItemId: sourceLineType === 'STOCK' ? (source?.stockItemId ?? source?.stockItem?.id ?? null) : null,
      saleItemIds: sourceLineType === 'STOCK' && sourceLineId > 0 ? [sourceLineId] : [],
      simpleItemIds: sourceLineType === 'SIMPLE' && sourceLineId > 0 ? [sourceLineId] : [],
      lineType: sourceLineType === 'STOCK' ? 'STOCK_ITEM' : 'SIMPLE',
      documentPrefix: '',
      documentDescriptionRaw: line?.description || '',
      documentDescription: line?.description || product?.name || 'สินค้า',
      documentSuffix: '',
      hasDocumentLine: true,
      productName: line?.description || product?.name || 'สินค้า',
      productModel: product?.model || source?.productModel || '-',
      price: unitAmount,
      quantity,
      unit: product?.unit?.name || source?.unit || 'ชิ้น',
      discount: 0,
      lineAmount,
      barcode: source?.barcode || source?.stockItem?.barcode || '-',
      serialNumber: '-',
    };
  });

  return groupPersistedDeliveryNoteRevisionItems(revisionItems);
};

export const applyPersistedDeliveryNoteRevisionToSale = ({ sale, authority } = {}) => {
  if (!sale || !hasPersistedDeliveryNoteRevision(authority)) return sale;
  const document = authority?.document || {};
  return {
    ...sale,
    code: document.documentNumber || sale.code,
    officialDocumentNumber: document.documentNumber || sale.officialDocumentNumber,
    soldAt: document.issuedAt || sale.soldAt,
    totalAmount: round2(document.activeAmount ?? document.totalAmount ?? sale.totalAmount),
  };
};
