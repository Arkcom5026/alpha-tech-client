import apiClient from '@/utils/apiClient';

const tokenKey = (shopSlug) => `alpha-tech:anonymous-session-token:${String(shopSlug || '').trim().toLowerCase()}`;
const proofKey = (shopSlug) => `alpha-tech:commerce-identity-proof:${String(shopSlug || '').trim().toLowerCase()}`;

export const getAnonymousSessionToken = (shopSlug) => {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(tokenKey(shopSlug)) || '';
};

export const setAnonymousSessionToken = (shopSlug, token) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(tokenKey(shopSlug), String(token || ''));
};

export const setCommerceIdentityProof = (shopSlug, proofToken) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(proofKey(shopSlug), String(proofToken || ''));
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
