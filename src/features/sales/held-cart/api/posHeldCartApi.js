import apiClient from '@/utils/apiClient';

const unwrap = (response) => response?.data?.data ?? response?.data;

export const listPosHeldCarts = async ({ status = 'OPEN', query = '' } = {}) => unwrap(
  await apiClient.get('/sales/held-carts', { params: { status, ...(query ? { query } : {}) } }),
);
export const getPosHeldCart = async (heldCartId) => unwrap(
  await apiClient.get(`/sales/held-carts/${heldCartId}`),
);
export const createPosHeldCart = async (payload) => unwrap(
  await apiClient.post('/sales/held-carts', payload),
);
export const updatePosHeldCart = async (heldCartId, payload) => unwrap(
  await apiClient.put(`/sales/held-carts/${heldCartId}`, payload),
);
export const revalidatePosHeldCart = async (heldCartId) => unwrap(
  await apiClient.post(`/sales/held-carts/${heldCartId}/revalidate`),
);
export const cancelPosHeldCart = async (heldCartId, reason) => unwrap(
  await apiClient.post(`/sales/held-carts/${heldCartId}/cancel`, { reason }),
);

export const getPosHeldCartErrorMessage = (error) => {
  const body = error?.response?.data;
  const code = body?.error?.code || body?.code;
  const message = body?.error?.message || body?.message || error?.message;
  const messages = {
    HELD_CART_ITEMS_REQUIRED: 'กรุณาเพิ่มสินค้าอย่างน้อยหนึ่งรายการก่อนพักรายการ',
    HELD_CART_VERSION_CONFLICT: 'ใบพักรายการถูกแก้ไขจากอีกเครื่อง กรุณาเปิดข้อมูลล่าสุดอีกครั้ง',
    HELD_CART_NOT_OPEN: 'ใบพักรายการนี้ถูกขายหรือยกเลิกไปแล้ว',
    HELD_CART_SNAPSHOT_CONFLICT: 'รายการขายไม่ตรงกับใบพักล่าสุด กรุณาบันทึกและลองใหม่',
  };
  return messages[code] || message || 'ไม่สามารถดำเนินการใบพักรายการขายได้';
};
