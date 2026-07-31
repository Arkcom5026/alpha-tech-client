export const projectAvailableStockItemsCommand = (productId) => {
  const normalizedProductId = Number(productId);

  if (!Number.isFinite(normalizedProductId) || normalizedProductId <= 0) {
    throw new Error('productId ต้องไม่ว่าง');
  }

  return { productId: normalizedProductId };
};

export const projectAvailableStockItemsResult = (sourceResponse) =>
  Array.isArray(sourceResponse) ? sourceResponse : [];
