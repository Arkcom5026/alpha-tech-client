import apiClient from '@/utils/apiClient';

const unwrap = (response) => response?.data?.data ?? response?.data ?? null;

export const getPartnerStoreCapability = async () =>
  unwrap(await apiClient.get('/partner-store/capability'));

export const savePartnerStoreCapability = async (payload) =>
  unwrap(await apiClient.put('/partner-store/capability', payload));

export const getStoreExperienceDraft = async () =>
  unwrap(await apiClient.get('/store-experience/draft'));

export const saveStoreExperienceDraft = async (payload) =>
  unwrap(await apiClient.put('/store-experience/draft', payload));
