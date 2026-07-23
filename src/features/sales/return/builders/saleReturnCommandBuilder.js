import { SALE_RETURN_ITEM_KIND } from '../contracts/saleReturnContract';

const number = (value) => Number(value || 0);
const roundMoney = (value) => Number(number(value).toFixed(2));

export const buildAvailableReturnItems = (eligibility) => [
  ...(eligibility?.serializedItems || [])
    .filter((item) => number(item.eligibleQuantity) > 0)
    .map((item) => ({
      ...item,
      kind: SALE_RETURN_ITEM_KIND.SERIALIZED,
      identity: `SERIALIZED:${item.saleItemId}`,
    })),
  ...(eligibility?.simpleItems || [])
    .filter((item) => number(item.eligibleQuantity) > 0)
    .map((item) => ({
      ...item,
      kind: SALE_RETURN_ITEM_KIND.SIMPLE,
      identity: `SIMPLE:${item.saleItemSimpleId}`,
    })),
];

export const buildSaleReturnProjection = ({
  availableItems,
  lineState,
  globalReason,
  refunds,
}) => {
  const selectedItems = availableItems
    .filter((item) => lineState[item.identity]?.selected)
    .map((item) => {
      const state = lineState[item.identity];
      const quantity = item.kind === SALE_RETURN_ITEM_KIND.SIMPLE
        ? number(state.quantity)
        : 1;
      const eligibleRefund = item.kind === SALE_RETURN_ITEM_KIND.SIMPLE
        ? roundMoney(number(item.eligibleRefund) * quantity / number(item.eligibleQuantity))
        : roundMoney(item.eligibleRefund);
      return {
        kind: item.kind,
        ...(item.kind === SALE_RETURN_ITEM_KIND.SIMPLE
          ? { saleItemSimpleId: item.saleItemSimpleId, quantity }
          : { saleItemId: item.saleItemId }),
        refundAmount: roundMoney(state.refundAmount),
        reason: String(state.reason || globalReason || '').trim(),
        eligibleRefund,
      };
    });

  const eligibleRefundTotal = roundMoney(
    selectedItems.reduce((total, item) => total + item.eligibleRefund, 0),
  );
  const actualRefundTotal = roundMoney(
    selectedItems.reduce((total, item) => total + item.refundAmount, 0),
  );
  const refundEvidenceTotal = roundMoney(
    refunds.reduce((total, refund) => total + number(refund.amount), 0),
  );

  return {
    selectedItems,
    eligibleRefundTotal,
    actualRefundTotal,
    refundEvidenceTotal,
    deductedAmount: roundMoney(eligibleRefundTotal - actualRefundTotal),
  };
};

export const buildSaleReturnCommand = ({
  commandId,
  saleId,
  reason,
  projection,
  refunds,
}) => ({
  commandId,
  saleId: Number(saleId),
  reason: String(reason || '').trim(),
  items: projection.selectedItems.map((item) => {
    const commandItem = { ...item };
    delete commandItem.eligibleRefund;
    return commandItem;
  }),
  refunds: refunds
    .filter((refund) => number(refund.amount) > 0)
    .map((refund) => ({
      method: refund.method,
      amount: roundMoney(refund.amount),
      ...(refund.sourcePaymentItemId
        ? { sourcePaymentItemId: Number(refund.sourcePaymentItemId) }
        : {}),
      ...(String(refund.referenceNo || '').trim()
        ? { referenceNo: String(refund.referenceNo).trim() }
        : {}),
      ...(String(refund.note || '').trim()
        ? { note: String(refund.note).trim() }
        : {}),
    })),
});
