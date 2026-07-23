const MONEY_TOLERANCE = 0.005;

export const validateSaleReturnDraft = ({
  availableItems,
  lineState,
  projection,
  reason,
  refunds,
  paymentItems,
}) => {
  if (!projection.selectedItems.length) return 'กรุณาเลือกรายการคืน';

  for (const item of availableItems) {
    const state = lineState[item.identity];
    if (!state?.selected) continue;
    const quantity = item.kind === 'SIMPLE' ? Number(state.quantity) : 1;
    if (!Number.isFinite(quantity) || quantity <= 0 || quantity > Number(item.eligibleQuantity)) {
      return `จำนวนคืนของ ${item.productName} ไม่ถูกต้อง`;
    }
    if (Number(state.refundAmount) < 0) return 'ยอดคืนเงินจริงต้องไม่ติดลบ';
  }

  if (projection.deductedAmount < -MONEY_TOLERANCE) {
    return 'ยอดคืนเงินจริงเกินมูลค่าที่คืนได้';
  }
  if (Math.abs(projection.actualRefundTotal - projection.refundEvidenceTotal) > MONEY_TOLERANCE) {
    return 'ยอดช่องทางคืนเงินต้องเท่ากับยอดคืนเงินจริง';
  }
  if (
    projection.deductedAmount > MONEY_TOLERANCE
    && !String(reason || '').trim()
    && projection.selectedItems.some((item) => !item.reason)
  ) {
    return 'กรุณาระบุเหตุผลเมื่อคืนเงินไม่เต็มจำนวน';
  }

  const paymentById = new Map(
    (paymentItems || []).map((item) => [Number(item.paymentItemId), item]),
  );
  const requestedBySource = new Map();
  for (const refund of refunds) {
    if (!refund.sourcePaymentItemId || Number(refund.amount || 0) <= 0) continue;
    const sourceId = Number(refund.sourcePaymentItemId);
    const source = paymentById.get(sourceId);
    if (!source) return 'รายการรับเงินอ้างอิงไม่อยู่ในใบขายนี้';
    const requested = (requestedBySource.get(sourceId) || 0) + Number(refund.amount);
    if (requested > Number(source.remainingRefundableAmount) + MONEY_TOLERANCE) {
      return 'ยอดคืนเงินเกินยอดคงเหลือของรายการรับเงินอ้างอิง';
    }
    requestedBySource.set(sourceId, requested);
  }
  return '';
};

export const mapSaleReturnFailure = (error) => {
  const code = error?.response?.data?.code;
  const message = error?.response?.data?.message || error?.message;
  if (code === 'RETURN_COMPLETION_CONFLICT') {
    return 'ข้อมูลถูกเปลี่ยนพร้อมกัน กรุณาโหลดข้อมูลล่าสุดแล้วตรวจสอบก่อนยืนยันอีกครั้ง';
  }
  if (code === 'RETURN_STOCK_CONFLICT' || code === 'RETURN_QUANTITY_CONFLICT') {
    return 'สถานะหรือจำนวนสินค้ามีการเปลี่ยนแปลง กรุณาโหลดข้อมูลล่าสุด';
  }
  if (code === 'DEDUCTED_REFUND_APPROVAL_REQUIRED') {
    return 'การคืนเงินไม่เต็มจำนวนต้องได้รับสิทธิ์อนุมัติจากผู้มีอำนาจ';
  }
  return message || 'ไม่สามารถทำรายการคืนสินค้าได้';
};
