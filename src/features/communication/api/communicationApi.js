import apiClient from '@/utils/apiClient';

const unwrap = (response) => response?.data?.data ?? response?.data ?? null;

export const listCommunicationProfiles = async () =>
  unwrap(await apiClient.get('/communication/profiles'));

export const saveCommunicationProfile = async (payload) =>
  unwrap(await apiClient.post('/communication/profiles', payload));

export const listCustomerContactChannels = async (customerId) =>
  unwrap(await apiClient.get(`/communication/customers/${customerId}/channels`));

export const saveCustomerContactChannel = async (customerId, payload) =>
  unwrap(await apiClient.post(`/communication/customers/${customerId}/channels`, payload));

export const getRepairCommunicationPreference = async (repairJobId) =>
  unwrap(await apiClient.get(`/communication/repairs/${repairJobId}/preference`));

export const saveRepairCommunicationPreference = async (repairJobId, payload) =>
  unwrap(await apiClient.put(`/communication/repairs/${repairJobId}/preference`, payload));

export const listRepairCommunicationActivities = async (repairJobId) =>
  unwrap(await apiClient.get(`/communication/repairs/${repairJobId}/activities`));

export const recordRepairCommunicationActivity = async (repairJobId, payload) =>
  unwrap(await apiClient.post(`/communication/repairs/${repairJobId}/activities`, payload));
