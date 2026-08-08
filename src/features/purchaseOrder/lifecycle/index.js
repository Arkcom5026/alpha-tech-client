import { updatePurchaseOrderStatus } from '../api/purchaseOrderApi';

export const cancelPurchaseOrder = async (purchaseOrderId) => {
  const id = Number(purchaseOrderId);
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error('Invalid purchase order id');
  }

  return updatePurchaseOrderStatus({ id, status: 'CANCELLED' });
};

export default {
  cancelPurchaseOrder,
};
