export const toPurchaseOrderPositiveInt = (value) => {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
};

export const hasPurchaseOrderProductSearchCriteria = ({
  productTypeId,
  brandId,
  search,
}) => Boolean(productTypeId || brandId || String(search || '').trim());

export const applyPurchaseOrderProductFilterPatch = (previous, patch) => {
  const updated = { ...previous, ...patch };

  if (
    Object.prototype.hasOwnProperty.call(patch, 'productTypeId') &&
    patch.productTypeId !== previous.productTypeId
  ) {
    updated.brandId = '';
  }

  return updated;
};
