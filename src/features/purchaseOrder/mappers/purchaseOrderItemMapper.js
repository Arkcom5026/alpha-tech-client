const toPositiveInt = (value) => {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
};

export const mapPurchaseOrderItem = (item) => {
  const product = item?.product || {};
  const productId = toPositiveInt(item?.productId ?? product?.id);

  if (!productId) return null;

  return {
    id: productId,
    productId,
    name: product.name || item?.productName || '-',
    model: product.model || item?.productModel || '-',
    category:
      item?.categoryName ||
      product.categoryName ||
      product.productType?.globalProductType?.category?.name ||
      '-',
    productType:
      item?.productTypeName ||
      product.productTypeName ||
      product.productType?.name ||
      '-',
    brandId: product.brandId ?? product.brand?.id ?? null,
    brandName:
      item?.brandName ||
      product.brandName ||
      product.brand?.name ||
      '-',
    templateTrace:
      item?.productTemplateName ||
      product.templateName ||
      product.templateProduct?.name ||
      null,
    quantity: item?.quantity,
    costPrice: item?.costPrice,
    receivedQuantity: item?.receivedQuantity ?? 0,
  };
};

export const mapPurchaseOrderItems = (items) =>
  (Array.isArray(items) ? items : []).map(mapPurchaseOrderItem).filter(Boolean);
