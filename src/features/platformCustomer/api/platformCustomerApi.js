import apiClient from '@/utils/apiClient';

export const getPlatformCustomerOverview = async ({
  query = '',
  branchId = '',
  provinceCode = '',
  districtCode = '',
  relationshipStatus = 'ALL',
  customerType = '',
  accountStatus = 'ALL',
  limit = 100,
} = {}) => {
  const response = await apiClient.get('/customers/platform/overview', {
    params: {
      q: String(query || '').trim(),
      branchId: branchId || undefined,
      provinceCode: provinceCode || undefined,
      districtCode: districtCode || undefined,
      relationshipStatus,
      customerType: customerType || undefined,
      accountStatus,
      limit,
    },
  });
  return response.data;
};
