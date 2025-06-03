import apiClient from '@/utils/apiClient';

export const getReceiptItemsByReceiptId = async (receiptId) => {
  try {
    const res = await apiClient.get(`/purchase-order-receipt-items/by-receipt/${receiptId}`);
    return res.data;
  } catch (error) {
    console.error('❌ [getReceiptItemsByReceiptId] error:', error);
    throw error;
  }
};

export const getReceiptItemsByReceiptIds = async (receiptIds) => {
  try {
    const res = await apiClient.post('/purchase-order-receipt-items/by-receipt-ids', { receiptIds });
    return res.data;
  } catch (error) {
    console.error('❌ [getReceiptItemsByReceiptIds] error:', error);
    throw error;
  }
};

export const addReceiptItem = async (data) => {
  try {
    const res = await apiClient.post('/purchase-order-receipt-items', data);
    return res.data;
  } catch (error) {
    console.error('❌ [addReceiptItem] error:', error);
    throw error;
  }
};

export const updateReceiptItem = async (data) => {
  try {
    const res = await apiClient.put('/purchase-order-receipt-items/update', data);
    return res.data;
  } catch (error) {
    console.error('❌ [updateReceiptItem] error:', error);
    throw error;
  }
};

export const deleteReceiptItem = async (id) => {
  try {
    const res = await apiClient.delete(`/purchase-order-receipt-items/${id}`);
    return res.data;
  } catch (error) {
    console.error('❌ [deleteReceiptItem] error:', error);
    throw error;
  }
};

export const getItemsByPOId = async (poId) => {
  const res = await apiClient.get(`/purchase-order-receipt-items/${poId}/po-items`);
  return res.data;
};
