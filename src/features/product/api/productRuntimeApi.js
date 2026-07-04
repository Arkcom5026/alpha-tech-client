import apiClient from '@/utils/apiClient';
import { parseApiError } from '@/utils/uiHelpers';

const stripRuntimeContext = (payload = {}) => {
  const sanitizedPayload = { ...payload };

  delete sanitizedPayload.branchId;
  delete sanitizedPayload.templateProductId;
  delete sanitizedPayload.productTemplateId;
  delete sanitizedPayload.items;
  delete sanitizedPayload.barcodes;
  delete sanitizedPayload.queue;
  delete sanitizedPayload.quantity;
  delete sanitizedPayload.stock;
  delete sanitizedPayload.movementType;
  delete sanitizedPayload.source;

  return sanitizedPayload;
};

export const createLocalOperationalProductRuntimeApi = async (payload = {}) => {
  try {
    const sanitizedPayload = stripRuntimeContext(payload);
    const { data } = await apiClient.post('products/pos/create-local', sanitizedPayload);
    return data;
  } catch (err) {
    throw parseApiError(err);
  }
};

export const createOperationalProductFromTemplateRuntimeApi = async (payload = {}) => {
  try {
    const sanitizedPayload = { ...payload };
    delete sanitizedPayload.branchId;

    const { data } = await apiClient.post('products/pos/create-from-template', sanitizedPayload);
    return data;
  } catch (err) {
    throw parseApiError(err);
  }
};
