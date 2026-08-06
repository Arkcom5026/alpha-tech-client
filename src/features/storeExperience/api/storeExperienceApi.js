import apiClient from '@/utils/apiClient';

const unwrap = (response) => response?.data?.data ?? response?.data ?? null;

export const getPartnerStoreCapability = async () =>
  unwrap(await apiClient.get('/partner-store/capability'));

export const savePartnerStoreCapability = async (payload) =>
  unwrap(await apiClient.put('/partner-store/capability', payload));

export const getOnlineProductVisibilityAudit = async () =>
  unwrap(await apiClient.get('/partner-store/online-products/visibility-audit'));

export const updateOnlineProductPrice = async (productId, payload) =>
  unwrap(await apiClient.patch(`/partner-store/online-products/${productId}/price`, payload));

export const getStoreExperienceDraft = async () =>
  unwrap(await apiClient.get('/store-experience/draft'));

export const saveStoreExperienceDraft = async (payload) =>
  unwrap(await apiClient.put('/store-experience/draft', payload));

export const publishStoreExperience = async () =>
  unwrap(await apiClient.post('/store-experience/publish'));

export const unpublishStoreExperience = async () =>
  unwrap(await apiClient.post('/store-experience/unpublish'));
