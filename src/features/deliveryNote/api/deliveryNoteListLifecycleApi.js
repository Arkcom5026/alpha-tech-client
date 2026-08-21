import apiClient from '@/utils/apiClient';

const unwrap = (response) => response?.data?.data ?? response?.data ?? [];

export const loadDeliveryNoteListLifecycleSummaries = async ({ saleIds } = {}) => {
  const ids = [...new Set((Array.isArray(saleIds) ? saleIds : [])
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0))];

  if (ids.length === 0) return [];

  return apiClient.get('/sales/delivery-note/lifecycle-summaries', {
    params: { saleIds: ids.join(',') },
  }).then(unwrap);
};
