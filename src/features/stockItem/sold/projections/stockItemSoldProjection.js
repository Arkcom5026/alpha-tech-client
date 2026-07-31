export const normalizeStockItemIdsForSold = (stockItemIds = []) => {
  if (!Array.isArray(stockItemIds)) return [];

  return [
    ...new Set(
      stockItemIds
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value) && value > 0)
    ),
  ];
};

export const projectStockItemSoldError = (error) => {
  const status = error?.response?.status;
  const payload = error?.response?.data;

  if (status === 409) {
    const message = payload?.message || 'มีบางรายการไม่สามารถเปลี่ยนเป็นขายแล้วได้';
    const mappedError = new Error(message);
    mappedError.name = 'StockItemNotSellableError';
    mappedError.status = 409;
    mappedError.code = payload?.code;
    mappedError.details = payload;
    return mappedError;
  }

  return error;
};
