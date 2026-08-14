import apiClient from '@/utils/apiClient';

export const issuePartnerStoreActivationInvitation = (applicationId) =>
  apiClient.post(`/partner-store/applications/${applicationId}/activation-invitations`);

export const claimPartnerStoreActivation = (payload) =>
  apiClient.post('/public/partner-store-applications/activation/claim', payload);
