const toNumber = (value, fallback = 0) => {
  if (value === '' || value === null || value === undefined) return fallback;
  const number = Number(String(value).replace(/,/g, ''));
  return Number.isFinite(number) ? number : fallback;
};

export const pickPurchaseOrderCostPrice = (row) => {
  const branchPrice = Array.isArray(row?.branchPrice)
    ? row.branchPrice[0]
    : row?.branchPrice;
  const branchPrices = Array.isArray(row?.branchPrices)
    ? row.branchPrices[0]
    : row?.branchPrices;
  const stockBalance = row?.stockBalance || row?.stockBalances?.[0] || null;

  return toNumber(
    row?.costPrice ??
      row?.cost ??
      row?.receivedCost ??
      row?.lastReceivedCost ??
      row?.purchaseCost ??
      branchPrice?.costPrice ??
      branchPrices?.costPrice ??
      stockBalance?.lastReceivedCost,
    0
  );
};
