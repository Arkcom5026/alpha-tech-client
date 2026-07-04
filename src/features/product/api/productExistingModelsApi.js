import apiClient from '@/utils/apiClient';
import { parseApiError } from '@/utils/uiHelpers';

export const getExistingProductModels = async ({ productTypeId, brandId, take = 80 } = {}) => {
  try {
    const pt = Number(productTypeId);
    const br = Number(brandId);

    if (!Number.isFinite(pt) || !Number.isFinite(br)) {
      return { items: [], total: 0 };
    }

    const { data } = await apiClient.get('products/duplicate-preview', {
      params: { productTypeId: pt, brandId: br, take, _ts: Date.now() },
    });

    const items = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
    const total = Number(data?.total ?? items.length);

    return { items, total: Number.isFinite(total) ? total : items.length };
  } catch (err) {
    throw parseApiError(err);
  }
};
