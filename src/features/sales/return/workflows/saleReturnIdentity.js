const STORAGE_PREFIX = 'sales:return:identity:';

const stable = (value) => {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') {
    return Object.keys(value).sort().reduce((result, key) => {
      result[key] = stable(value[key]);
      return result;
    }, {});
  }
  return value;
};

const createCommandId = () => (
  globalThis.crypto?.randomUUID?.()
  || `return-${Date.now()}-${Math.random().toString(16).slice(2)}`
);

export const fingerprintSaleReturn = (materialPayload) => (
  JSON.stringify(stable(materialPayload))
);

export const getSaleReturnIdentity = (saleId, materialPayload) => {
  const storageKey = `${STORAGE_PREFIX}${saleId}`;
  const fingerprint = fingerprintSaleReturn(materialPayload);
  try {
    const stored = JSON.parse(sessionStorage.getItem(storageKey) || 'null');
    if (stored?.commandId && stored.fingerprint === fingerprint) return stored;
  } catch {
    // Invalid storage is replaced with a fresh durable identity.
  }
  const identity = { commandId: createCommandId(), fingerprint };
  sessionStorage.setItem(storageKey, JSON.stringify(identity));
  return identity;
};

export const clearSaleReturnIdentity = (saleId) => {
  sessionStorage.removeItem(`${STORAGE_PREFIX}${saleId}`);
};
