export const PURCHASE_ORDER_EDITABLE_STATUS = 'PENDING';

export const canEditPurchaseOrder = (purchaseOrder) =>
  String(purchaseOrder?.status || '').toUpperCase() === PURCHASE_ORDER_EDITABLE_STATUS;

export const getPurchaseOrderEditBlockedReason = (purchaseOrder) =>
  canEditPurchaseOrder(purchaseOrder)
    ? ''
    : 'แก้ไขได้เฉพาะใบสั่งซื้อที่อยู่ในสถานะรอดำเนินการ';
