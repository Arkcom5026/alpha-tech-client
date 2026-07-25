const toNumber = (value) => Number(String(value ?? '').replace(/,/g, ''));

export const buildPurchaseOrderItems = (products) =>
  (Array.isArray(products) ? products : [])
    .map((product) => ({
      productId: Number(product?.productId || product?.id),
      quantity: Number.parseInt(String(product?.quantity ?? '1'), 10),
      costPrice: toNumber(product?.costPrice ?? 0),
    }))
    .filter(
      (item) =>
        Number.isInteger(item.productId) &&
        item.productId > 0 &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0 &&
        Number.isFinite(item.costPrice) &&
        item.costPrice >= 0
    );

export const buildCreatePurchaseOrderPayload = ({ supplierId, note, products }) => ({
  supplierId: Number(supplierId),
  note: note || '',
  items: buildPurchaseOrderItems(products),
});

export const buildUpdatePurchaseOrderPayload = ({ note, products }) => ({
  note: note || '',
  items: buildPurchaseOrderItems(products),
});
