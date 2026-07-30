import apiClient from '@/utils/apiClient';

export const submitPartnerStoreApplication = (payload) =>
  apiClient.post('/public/partner-store-applications', payload);

export const listPartnerStoreApplications = (status) =>
  apiClient.get('/partner-store/applications', {
    params: status ? { status } : undefined,
  });

export const approvePartnerStoreApplication = (applicationId, payload) =>
  apiClient.post(`/partner-store/applications/${applicationId}/approve`, payload);

export const rejectPartnerStoreApplication = (applicationId, payload) =>
  apiClient.post(`/partner-store/applications/${applicationId}/reject`, payload);
