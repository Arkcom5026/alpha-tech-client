export const projectStockItemSearchResult = (sourceResponse) => sourceResponse ?? null;

export const projectStockItemSearchError = (error) => {
  const statusCode = error?.response?.status;
  const payload = error?.response?.data;

  if (statusCode === 409) {
    return {
      handled: true,
      result: {
        notSellable: true,
        status: payload?.status,
        code: payload?.code,
        message: payload?.message || 'สินค้านี้ไม่พร้อมขาย',
      },
    };
  }

  if (statusCode === 404) {
    return { handled: true, result: null };
  }

  return { handled: false, error };
};
