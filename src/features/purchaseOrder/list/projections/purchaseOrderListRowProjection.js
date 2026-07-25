const normalizeStatus = (status) => String(status || '').toUpperCase();

export const projectPurchaseOrderListStatus = (status) => {
  const normalized = normalizeStatus(status);

  if (normalized === 'PENDING') {
    return {
      key: normalized,
      label: 'รอดำเนินการ',
      tone: 'pending',
    };
  }

  if (normalized === 'PARTIALLY_RECEIVED') {
    return {
      key: normalized,
      label: 'รับของแล้วบางส่วน',
      tone: 'partial',
    };
  }

  if (normalized === 'RECEIVED' || normalized === 'COMPLETED') {
    return {
      key: normalized,
      label: 'เสร็จสมบูรณ์',
      tone: 'completed',
    };
  }

  return {
    key: normalized,
    label: status || '-',
    tone: 'neutral',
  };
};

export const projectPurchaseOrderListRow = (purchaseOrder) => ({
  id: purchaseOrder?.id,
  code: purchaseOrder?.code || '-',
  createdAtLabel: purchaseOrder?.createdAt
    ? new Date(purchaseOrder.createdAt).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '-',
  supplierName: purchaseOrder?.supplier?.name || 'ไม่ระบุคู่ค้า',
  totalAmountLabel: Number.isFinite(Number(purchaseOrder?.totalAmount))
    ? Number(purchaseOrder.totalAmount).toLocaleString('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : '0.00',
  status: projectPurchaseOrderListStatus(purchaseOrder?.status),
  canEdit: normalizeStatus(purchaseOrder?.status) === 'PENDING',
});

export const projectPurchaseOrderListRows = (purchaseOrders) =>
  (Array.isArray(purchaseOrders) ? purchaseOrders : []).map(projectPurchaseOrderListRow);
