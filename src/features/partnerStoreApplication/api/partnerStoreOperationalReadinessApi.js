import apiClient from '@/utils/apiClient';

export const getPartnerStoreOperationalReadiness = () =>
  apiClient.get('/partner-store/readiness/me');

export const certifyPartnerStoreOperationalReadiness = () =>
  apiClient.post('/partner-store/readiness/certify');
