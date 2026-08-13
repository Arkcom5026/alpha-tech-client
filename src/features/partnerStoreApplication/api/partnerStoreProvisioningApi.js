import apiClient from '@/utils/apiClient';

export const provisionPartnerStoreApplication = (applicationId) =>
  apiClient.post(`/partner-store/applications/${applicationId}/provision`);
