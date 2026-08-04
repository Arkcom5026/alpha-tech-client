import apiClient from '@/utils/apiClient';

const normalizeSlug = (shopSlug) => String(shopSlug || '').trim().toLowerCase();
const tokenKey = (shopSlug) => `alpha-tech:anonymous-session-token:${normalizeSlug(shopSlug)}`;
const proofKey = (shopSlug) => `alpha-tech:commerce-identity-proof:${normalizeSlug(shopSlug)}`;
const idempotencyKey = (shopSlug) => `alpha-tech:reservation-commitment-key:${normalizeSlug(shopSlug)}`;

const createIdempotencyKey = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `storefront:${crypto.randomUUID()}`;
  }
  return `storefront:${Date.now().toString(36)}:${Math.random().toString(36).slice(2)}:${Math.random().toString(36).slice(2)}`;
};

export const getAnonymousSessionToken = (shopSlug) => {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(tokenKey(shopSlug)) || '';
};

export const setAnonymousSessionToken = (shopSlug, token) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(tokenKey(shopSlug), String(token || ''));
};

export const getCommerceIdentityProof = (shopSlug) => {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(proofKey(shopSlug)) || '';
};

export const setCommerceIdentityProof = (shopSlug, proofToken) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(proofKey(shopSlug), String(proofToken || ''));
};

export const getOrCreateCommitmentIdempotencyKey = (shopSlug) => {
  if (typeof window === 'undefined') return createIdempotencyKey();
  const key = idempotencyKey(shopSlug);
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const created = createIdempotencyKey();
  window.localStorage.setItem(key, created);
  return created;
};

export const clearStorefrontCommitmentAuthority = (shopSlug) => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(tokenKey(shopSlug));
  window.localStorage.removeItem(proofKey(shopSlug));
  window.localStorage.removeItem(idempotencyKey(shopSlug));
};

export const createAnonymousServerSession = async (shopSlug) => {
  const response = await apiClient.post(
    `/sales/storefronts/${encodeURIComponent(shopSlug)}/session`,
    {},
    { skipAuthBootstrap: true },
  );
  const token = response?.data?.token || '';
  if (token) setAnonymousSessionToken(shopSlug, token);
  return { token, session: response?.data?.data || null };
};

export const setAnonymousServerSessionItem = async ({ shopSlug, token, productId, quantity }) => {
  const response = await apiClient.put(
    `/sales/storefronts/${encodeURIComponent(shopSlug)}/session/items/${encodeURIComponent(productId)}`,
    { quantity },
    { skipAuthBootstrap: true, headers: { 'X-Anonymous-Session-Token': token } },
  );
  return response?.data?.data || null;
};

export const requestCommitmentIdentity = async ({ shopSlug, token, phone }) => {
  const response = await apiClient.post(
    `/sales/storefronts/${encodeURIComponent(shopSlug)}/identity/request`,
    { phone },
    { skipAuthBootstrap: true, headers: { 'X-Anonymous-Session-Token': token } },
  );
  return response?.data?.data || null;
};

export const verifyCommitmentIdentity = async ({ shopSlug, token, challengeId, otp }) => {
  const response = await apiClient.post(
    `/sales/storefronts/${encodeURIComponent(shopSlug)}/identity/verify`,
    { challengeId, otp },
    { skipAuthBootstrap: true, headers: { 'X-Anonymous-Session-Token': token } },
  );
  const data = response?.data?.data || null;
  if (data?.proofToken) setCommerceIdentityProof(shopSlug, data.proofToken);
  return data;
};

export const commitProductReservation = async ({ shopSlug, token, proofToken, commitmentKey }) => {
  const response = await apiClient.post(
    `/sales/storefronts/${encodeURIComponent(shopSlug)}/commitment`,
    {},
    {
      skipAuthBootstrap: true,
      headers: {
        'X-Anonymous-Session-Token': token,
        'X-Commerce-Identity-Proof': proofToken,
        'X-Idempotency-Key': commitmentKey,
      },
    },
  );
  return response?.data?.data || null;
};
