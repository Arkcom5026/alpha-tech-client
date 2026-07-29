export const validateSalePaymentConfirmation = ({
  calculation,
  saleMode,
  hasValidCustomerId,
  hasImmediatePayment,
  isSubmitting,
  paymentIntent,
} = {}) => {
  if (!calculation?.itemCount) {
    return { ok: false, error: 'กรุณาเพิ่มรายการสินค้าก่อนยืนยันการขาย' };
  }

  if (isSubmitting) {
    return { ok: false, error: 'กำลังดำเนินการ กรุณารอสักครู่' };
  }

  if (
    saleMode === 'CASH' &&
    calculation.grandTotalPaid < calculation.totalToPay
  ) {
    return { ok: false, error: 'ยอดเงินที่ชำระยังไม่เพียงพอ' };
  }

  if (calculation.safeBillDiscount > calculation.totalOriginalPrice) {
    return { ok: false, error: 'ส่วนลดท้ายบิลห้ามเกินยอดรวมราคาสินค้า' };
  }

  if (saleMode === 'CREDIT' && !hasValidCustomerId) {
    return { ok: false, error: 'การขายแบบเครดิตต้องเลือกชื่อลูกค้าก่อน' };
  }

  if (saleMode === 'CREDIT' && hasImmediatePayment) {
    return {
      ok: false,
      error: 'โหมดเครดิต: ห้ามกรอกเงินสด/โอน/บัตรทันที (อนุญาตเฉพาะ “มัดจำ”)',
    };
  }

  if (saleMode === 'CASH' && !paymentIntent?.paymentItems?.length) {
    return { ok: false, error: 'Payment evidence is required' };
  }

  return { ok: true };
};
