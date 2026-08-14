import apiClient from '@/utils/apiClient';

export const getPartnerStoreOnboarding = () =>
  apiClient.get('/partner-store/onboarding/me');

export const completePartnerStoreOnboarding = (payload) =>
  apiClient.post('/partner-store/onboarding/complete', payload);
