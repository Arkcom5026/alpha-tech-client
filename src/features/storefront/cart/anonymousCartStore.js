import { useMemo, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'alpha-tech:anonymous-cart:v1';
const listeners = new Set();
const EMPTY_STATE = Object.freeze({ version: 1, stores: Object.freeze({}) });
let snapshot = null;

const emptyState = () => ({ version: 1, stores: {} });

const sanitizeQuantity = (value, maximum = Number.MAX_SAFE_INTEGER) => {
  const number = Math.floor(Number(value) || 0);
  return Math.max(0, Math.min(number, Math.max(0, Number(maximum) || 0)));
};

const readState = () => {
  if (snapshot) return snapshot;
  if (typeof window === 'undefined') return EMPTY_STATE;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null');
    snapshot = parsed?.version === 1 && parsed?.stores && typeof parsed.stores === 'object' ? parsed : emptyState();
  } catch {
    snapshot = emptyState();
  }
  return snapshot;
};

const writeState = (next) => {
  snapshot = next;
  if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  listeners.forEach((listener) => listener());
};

const normalizeSlug = (value) => String(value || '').trim().toLowerCase();

const selectAnonymousCart = (state, shopSlug) => {
  const slug = normalizeSlug(shopSlug);
  const store = state?.stores?.[slug];
  return {
    shopSlug: slug,
    storefrontName: store?.storefrontName || '',
    items: Array.isArray(store?.items) ? store.items : [],
    updatedAt: store?.updatedAt || null,
  };
};

export const getAnonymousCart = (shopSlug) => selectAnonymousCart(readState(), shopSlug);

export const addAnonymousCartItem = ({ shopSlug, storefrontName, product, quantity = 1 }) => {
  const slug = normalizeSlug(shopSlug);
  const productId = Number(product?.id);
  if (!slug || !Number.isInteger(productId) || productId <= 0) return getAnonymousCart(slug);

  const state = readState();
  const currentStore = state.stores[slug] || { storefrontName: '', items: [] };
  const availableQuantity = Math.max(0, Number(product?.availability?.quantity || 0));
  if (availableQuantity <= 0) return getAnonymousCart(slug);

  const existing = currentStore.items.find((item) => item.productId === productId);
  const nextQuantity = sanitizeQuantity((existing?.quantity || 0) + quantity, availableQuantity);
  const nextItem = {
    productId,
    name: String(product?.name || ''),
    priceSnapshot: Number(product?.priceOnline || product?.price?.amount || 0),
    imageUrl: product?.coverImageUrl || product?.images?.[0]?.url || null,
    unitName: product?.unit?.name || null,
    availableQuantitySnapshot: availableQuantity,
    quantity: nextQuantity,
    capturedAt: new Date().toISOString(),
  };
  const items = existing
    ? currentStore.items.map((item) => (item.productId === productId ? nextItem : item))
    : [...currentStore.items, nextItem];

  writeState({
    ...state,
    stores: {
      ...state.stores,
      [slug]: {
        storefrontName: storefrontName || currentStore.storefrontName || '',
        items,
        updatedAt: new Date().toISOString(),
      },
    },
  });
  return getAnonymousCart(slug);
};

export const updateAnonymousCartItemQuantity = ({ shopSlug, productId, quantity }) => {
  const slug = normalizeSlug(shopSlug);
  const state = readState();
  const store = state.stores[slug];
  if (!store) return getAnonymousCart(slug);
  const id = Number(productId);
  const items = store.items
    .map((item) => item.productId === id
      ? { ...item, quantity: sanitizeQuantity(quantity, item.availableQuantitySnapshot) }
      : item)
    .filter((item) => item.quantity > 0);
  writeState({ ...state, stores: { ...state.stores, [slug]: { ...store, items, updatedAt: new Date().toISOString() } } });
  return getAnonymousCart(slug);
};

export const removeAnonymousCartItem = ({ shopSlug, productId }) =>
  updateAnonymousCartItemQuantity({ shopSlug, productId, quantity: 0 });

export const clearAnonymousCart = (shopSlug) => {
  const slug = normalizeSlug(shopSlug);
  const state = readState();
  const stores = { ...state.stores };
  delete stores[slug];
  writeState({ ...state, stores });
};

export const subscribeAnonymousCart = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useAnonymousCart = (shopSlug) => {
  const state = useSyncExternalStore(subscribeAnonymousCart, readState, () => EMPTY_STATE);
  const slug = normalizeSlug(shopSlug);
  return useMemo(() => selectAnonymousCart(state, slug), [state, slug]);
};

export const getAnonymousCartItemCount = (cart) =>
  (cart?.items || []).reduce((total, item) => total + Number(item.quantity || 0), 0);

export const getAnonymousCartSubtotal = (cart) =>
  (cart?.items || []).reduce((total, item) => total + Number(item.priceSnapshot || 0) * Number(item.quantity || 0), 0);
