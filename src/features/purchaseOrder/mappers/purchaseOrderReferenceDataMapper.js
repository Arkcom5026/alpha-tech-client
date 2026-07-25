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

export const extractPurchaseOrderReferenceRows = (payload) => {
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

export const mapPurchaseOrderProductTypeOption = (row) => {
  const id = toPositiveInt(row?.id ?? row?.productTypeId ?? row?.typeId);
  const name = String(row?.name ?? row?.label ?? row?.title ?? '').trim();
  if (!id || !name) return null;

  return {
    ...row,
    id,
    name,
    active: row?.active ?? row?.isActive ?? true,
  };
};

export const mapPurchaseOrderBrandOption = (row) => {
  const id = toPositiveInt(row?.id ?? row?.brandId);
  const name = String(row?.name ?? row?.label ?? row?.title ?? '').trim();
  if (!id || !name) return null;

  return {
    ...row,
    id,
    name,
    active: row?.active ?? row?.isActive ?? true,
  };
};

export const mapPurchaseOrderSuppliersResponse = (payload) =>
  extractPurchaseOrderReferenceRows(payload);

export const mapPurchaseOrderDropdownsResponse = (payload) => ({
  productTypes: extractPurchaseOrderReferenceRows(payload?.productTypes)
    .map(mapPurchaseOrderProductTypeOption)
    .filter(Boolean),
  brands: extractPurchaseOrderReferenceRows(payload?.brands)
    .map(mapPurchaseOrderBrandOption)
    .filter(Boolean),
});

export const mapPurchaseOrderBrandsResponse = (payload) =>
  extractPurchaseOrderReferenceRows(payload)
    .map(mapPurchaseOrderBrandOption)
    .filter(Boolean);
