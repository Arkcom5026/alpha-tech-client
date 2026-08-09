import apiClient from '@/utils/apiClient';

const unwrap = (response) => response?.data ?? {};

export const getInputVatReport = async ({ month, year, startDate, endDate } = {}) => {
  const response = await apiClient.get('/input-tax-reports', {
    params: startDate && endDate
      ? { startDate, endDate }
      : { month: Number(month), year: Number(year) },
  });

  return unwrap(response);
};
