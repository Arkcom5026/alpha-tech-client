import apiClient from '@/utils/apiClient';
import { parseApiError } from '@/utils/uiHelpers';

const normalizeBarcodeItems = (items) => {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => {
      if (typeof item === 'string') {
        return { barcode: item, serialNumber: item };
      }

      const barcode = item?.barcode ?? item?.serialNumber ?? item?.sn ?? '';
      const serialNumber = item?.serialNumber ?? item?.barcode ?? item?.sn ?? '';
      return { ...item, barcode, serialNumber };
    })
    .filter((item) => item?.barcode || item?.serialNumber);
};

export const commitQuickStockExistingIntakeApi = async (payload = {}) => {
  try {
    const sanitizedPayload = { ...payload };
    delete sanitizedPayload.branchId;
    delete sanitizedPayload.movementType;
    delete sanitizedPayload.source;

    const rawItems =
      sanitizedPayload.items ?? sanitizedPayload.barcodes ?? sanitizedPayload.queue ?? [];
    sanitizedPayload.items = normalizeBarcodeItems(rawItems);
    delete sanitizedPayload.barcodes;
    delete sanitizedPayload.queue;

    const { data } = await apiClient.post('quick-stock/existing', sanitizedPayload);
    return data;
  } catch (err) {
    throw parseApiError(err);
  }
};
