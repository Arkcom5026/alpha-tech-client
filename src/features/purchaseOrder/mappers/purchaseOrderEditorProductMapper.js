import { pickPurchaseOrderCostPrice } from '../policies/purchaseOrderPricingPolicy';

const toPositiveInt = (value) => {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
};

export const mapProductToPurchaseOrderEditorItem = (product) => {
  const productId = toPositiveInt(product?.productId ?? product?.id);
  if (!productId) return null;

  return {
    id: productId,
    productId,
    name: product?.name || '-',
    model: product?.model || '-',
    category: product?.categoryName || product?.category || '-',
    productType: product?.productTypeName || product?.productType || '-',
    brandId: product?.brandId ?? null,
    brandName: product?.brandName || '-',
    templateTrace: product?.templateTrace || null,
    quantity: product?.quantity || 1,
    costPrice: pickPurchaseOrderCostPrice(product),
  };
};
