export const resolvePurchaseOrderBranchId = ({ selectedBranchId, branchDetail, authBranchId } = {}) => {
  const raw =
    selectedBranchId ??
    branchDetail?.id ??
    branchDetail?.branchId ??
    authBranchId ??
    null;

  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : null;
};

export const normalizePurchaseOrderItems = (po) => (
  Array.isArray(po?.items) ? po.items : []
);

export const projectPurchaseOrderLine = (item, index = 0) => {
  const quantity = Number(item?.quantity ?? 0);
  const costPrice = Number(item?.costPrice ?? 0);

  return {
    id: item?.id ?? index,
    name: item?.product?.name || item?.productName || '-',
    quantity,
    costPrice,
    lineTotal: quantity * costPrice,
  };
};

export const preparePurchaseOrderPrintProjection = (po) => {
  const sourceItems = normalizePurchaseOrderItems(po);
  const lines = sourceItems.map((item, index) => projectPurchaseOrderLine(item, index));
  const total = lines.reduce((sum, line) => sum + line.lineTotal, 0);

  return {
    lines,
    total,
  };
};

export const formatPurchaseOrderMoney = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return '0.00';

  return number.toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
