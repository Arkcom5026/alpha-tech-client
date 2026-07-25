import { pickPurchaseOrderCostPrice } from '../policies/purchaseOrderPricingPolicy';

const toPositiveInt = (value) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
};

const firstArray = (...values) => {
  for (const value of values) {
    if (Array.isArray(value)) return value;
  }
  return [];
};

export const extractPurchaseOrderProductSearchRows = (payload) => {
  if (Array.isArray(payload)) return payload;
  return firstArray(
    payload?.items,
    payload?.products,
    payload?.data,
    payload?.data?.items,
    payload?.data?.products,
    payload?.rows,
    payload?.records
  );
};

export const mapPurchaseOrderProductSearchRow = (row) => {
  const id = toPositiveInt(row?.id ?? row?.productId);
  if (!id) return null;

  const categoryName =
    row?.categoryName ??
    row?.productType?.globalProductType?.category?.name ??
    (typeof row?.category === 'string' ? row.category : row?.category?.name) ??
    '-';
  const productTypeName =
    row?.productTypeName ??
    (typeof row?.productType === 'string' ? row.productType : row?.productType?.name) ??
    '-';
  const brandName =
    row?.brandName ??
    row?.brand?.name ??
    (typeof row?.brand === 'string' ? row.brand : null) ??
    '-';

  return {
    ...row,
    id,
    productId: id,
    name: row?.name ?? row?.title ?? '-',
    category: categoryName,
    categoryName,
    productType: productTypeName,
    productTypeName,
    brandId: row?.brandId ?? row?.brand?.id ?? null,
    brandName,
    templateTrace:
      row?.templateName ??
      row?.productTemplateName ??
      row?.templateProduct?.name ??
      null,
    model: row?.model ?? row?.spec ?? '-',
    description: row?.description ?? '',
    costPrice: pickPurchaseOrderCostPrice(row),
    branchPrice: row?.branchPrice ?? row?.branchPrices ?? [],
    stockBalance: row?.stockBalance ?? null,
  };
};

export const mapPurchaseOrderProductSearchResponse = (payload) =>
  extractPurchaseOrderProductSearchRows(payload)
    .map(mapPurchaseOrderProductSearchRow)
    .filter(Boolean);
