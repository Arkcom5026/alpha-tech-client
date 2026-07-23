export const normalizeStockItemId = (item) => {
  const raw = item?.stockItemId ?? item?.stockItem?.id ?? item?.id ?? null;
  const value = raw == null ? null : Number(raw);
  return Number.isFinite(value) ? value : null;
};

export const devError = (...args) => {
  try {
    if (import.meta?.env?.DEV) console.error(...args);
  } catch {
    // Development diagnostics must never affect runtime behavior.
  }
};

export const normalizePrintableRows = (rows) => {
  if (Array.isArray(rows)) return rows;
  if (rows && typeof rows === 'object') {
    if (Array.isArray(rows.items)) return rows.items;
    if (Array.isArray(rows.sales)) return rows.sales;
    if (Array.isArray(rows.data)) return rows.data;
    const result = rows.result;
    if (result && typeof result === 'object') {
      if (Array.isArray(result.items)) return result.items;
      if (Array.isArray(result.sales)) return result.sales;
      if (Array.isArray(result.data)) return result.data;
    }
  }
  return [];
};

export const normalizeSaleDetail = (sale) => {
  if (!sale || typeof sale !== 'object') return sale;
  const branch = sale.branch || sale.Branch || sale?.employee?.branch || sale?.employee?.Branch || null;
  const normalizedBranch = branch && typeof branch === 'object' ? branch : null;
  const branchTaxId =
    normalizedBranch?.taxId ??
    normalizedBranch?.taxNo ??
    normalizedBranch?.taxNumber ??
    normalizedBranch?.taxpayerId ??
    sale?.branchTaxId ??
    sale?.taxId ??
    null;
  return { ...sale, branch: normalizedBranch || sale.branch || null, branchTaxId };
};
