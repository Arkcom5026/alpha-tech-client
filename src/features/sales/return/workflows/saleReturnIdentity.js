const key = (saleId) => `sales:return:command:${saleId}`;

export const getSaleReturnCommandId = (saleId) => {
  const storageKey = key(saleId);
  const stored = sessionStorage.getItem(storageKey);
  if (stored) return stored;
  const created = globalThis.crypto?.randomUUID?.() || `return-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  sessionStorage.setItem(storageKey, created);
  return created;
};

export const clearSaleReturnCommandId = (saleId) => {
  sessionStorage.removeItem(key(saleId));
};
