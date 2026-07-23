const STORAGE_KEY = 'alpha-tech.sales.checkout-command.v2';

const stable = (value) => {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') {
    return Object.keys(value).sort().reduce((result, key) => {
      if (value[key] !== undefined) result[key] = stable(value[key]);
      return result;
    }, {});
  }
  return value;
};

export const fingerprintSaleCompletion = (payload) => {
  const materialPayload = {
    ...payload,
    payment: payload?.payment && typeof payload.payment === 'object' && !Array.isArray(payload.payment)
      ? Object.fromEntries(
          Object.entries(payload.payment).filter(([key]) => key !== 'receivedAt')
        )
      : payload?.payment,
  };
  const input = JSON.stringify(stable(materialPayload));
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `v2-${(hash >>> 0).toString(16).padStart(8, '0')}-${input.length}`;
};

const createCommandId = () =>
  globalThis.crypto?.randomUUID?.() ||
  `sale-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const getSaleCompletionIdentity = (payload, storage = globalThis.sessionStorage) => {
  const fingerprint = fingerprintSaleCompletion(payload);
  let current = null;
  try {
    current = JSON.parse(storage?.getItem(STORAGE_KEY) || 'null');
  } catch {
    current = null;
  }
  if (current?.commandId && current?.fingerprint === fingerprint) {
    if (current.receivedAt) return current;
    const upgraded = { ...current, receivedAt: new Date().toISOString() };
    storage?.setItem(STORAGE_KEY, JSON.stringify(upgraded));
    return upgraded;
  }
  const identity = {
    commandId: createCommandId(),
    fingerprint,
    receivedAt: new Date().toISOString(),
  };
  storage?.setItem(STORAGE_KEY, JSON.stringify(identity));
  return identity;
};

export const clearSaleCompletionIdentity = (storage = globalThis.sessionStorage) => {
  storage?.removeItem(STORAGE_KEY);
};

export const SALE_COMPLETION_IDENTITY_STORAGE_KEY = STORAGE_KEY;
