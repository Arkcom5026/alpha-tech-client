const buildAvailableReturnItems = (eligibility) => [
  ...(eligibility?.serializedItems || [])
    .filter((item) => item.eligibleQuantity > 0)
    .map((item) => ({ ...item, kind: 'SERIALIZED', id: item.saleItemId })),
  ...(eligibility?.simpleItems || [])
    .filter((item) => item.eligibleQuantity > 0)
    .map((item) => ({ ...item, kind: 'SIMPLE', id: item.saleItemSimpleId })),
];

const buildSelectedReturnItems = ({ available = [], lines = {}, reason = '' }) => available
  .filter((item) => lines[`${item.kind}:${item.id}`]?.selected)
  .map((item) => {
    const state = lines[`${item.kind}:${item.id}`];
    return {
      kind: item.kind,
      ...(item.kind === 'SIMPLE' ? { saleItemSimpleId: item.id } : { saleItemId: item.id }),
      quantity: item.kind === 'SIMPLE' ? Number(state.quantity || 0) : 1,
      refundAmount: Number(state.refundAmount || 0),
      reason: state.reason?.trim() || reason.trim(),
    };
  });

const calculateSaleReturnAmounts = ({ available = [], selectedItems = [], refunds = [] }) => {
  const eligibleTotal = selectedItems.reduce((total, item) => {
    const source = available.find(
      (candidate) => candidate.kind === item.kind && candidate.id === (item.saleItemId || item.saleItemSimpleId),
    );
    return total + (item.kind === 'SIMPLE'
      ? Number(source?.eligibleRefund || 0) * item.quantity / Number(source?.eligibleQuantity || 1)
      : Number(source?.eligibleRefund || 0));
  }, 0);

  const refundTotal = selectedItems.reduce((total, item) => total + item.refundAmount, 0);
  const channelTotal = refunds.reduce((total, refund) => total + Number(refund.amount || 0), 0);
  const deduction = Math.max(0, eligibleTotal - refundTotal);

  return { eligibleTotal, refundTotal, channelTotal, deduction };
};

const validateSaleReturnSubmission = ({
  selectedItems = [],
  refundTotal = 0,
  channelTotal = 0,
  deduction = 0,
  reason = '',
}) => {
  if (!selectedItems.length) return 'กรุณาเลือกรายการคืน';
  if (Math.abs(refundTotal - channelTotal) > 0.005) return 'ยอดช่องทางคืนเงินต้องเท่ากับยอดคืนจริง';
  if (deduction > 0 && !reason.trim() && selectedItems.some((item) => !item.reason)) {
    return 'กรุณาระบุเหตุผลเมื่อคืนเงินไม่เต็มจำนวน';
  }
  return '';
};

const isFullRefundReturn = ({ eligibleTotal, refundTotal, saleTotal, deduction }) => (
  Math.abs(Number(eligibleTotal || 0) - Number(saleTotal || 0)) <= 0.005
  && Math.abs(Number(refundTotal || 0) - Number(saleTotal || 0)) <= 0.005
  && Number(deduction || 0) <= 0.005
);

export {
  buildAvailableReturnItems,
  buildSelectedReturnItems,
  calculateSaleReturnAmounts,
  isFullRefundReturn,
  validateSaleReturnSubmission,
};
