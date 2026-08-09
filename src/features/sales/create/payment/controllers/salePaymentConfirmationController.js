import { mapSalePaymentIntent } from '../services/salePaymentIntentMapper';
import { validateSalePaymentConfirmation } from '../services/salePaymentValidation';

const projectSaleOption = ({ saleMode, saleOption }) => {
  if (saleMode === 'CREDIT') return 'DELIVERY_NOTE';
  return saleOption === 'NONE' ? 'RECEIPT' : saleOption;
};

const closeReservedPrintWindow = (confirmContext) => {
  confirmContext?.printWindow?.close?.();
};

export const executeSalePaymentConfirmation = async ({
  calculation,
  saleMode,
  saleOption,
  includeDeliveryNote = false,
  customerType,
  hasValidCustomerId,
  hasImmediatePayment,
  isSubmitting,
  paymentList,
  selectedDeposit,
  cardRef,
  confirmContext = {},
  onConfirmSale,
  onSaleConfirmed,
} = {}) => {
  const paymentIntent = mapSalePaymentIntent({
    paymentList,
    changeAmount: calculation?.safeChangeAmount,
    depositUsed: calculation?.safeDepositUsed,
    selectedDeposit,
    cardRef,
  });

  const validation = validateSalePaymentConfirmation({
    calculation,
    saleMode,
    hasValidCustomerId,
    hasImmediatePayment,
    isSubmitting,
    paymentIntent,
  });

  if (!validation.ok) {
    return validation;
  }

  if (typeof onConfirmSale !== 'function') {
    return {
      ok: false,
      error: 'ระบบยืนยันการขายยังไม่พร้อมใช้งาน (missing onConfirmSale)',
    };
  }

  try {
    const response = await onConfirmSale({
      deliveryNoteMode: saleMode === 'CREDIT' || includeDeliveryNote ? 'PRINT' : undefined,
      saleType: customerType === 'GOVERNMENT' ? 'GOVERNMENT' : undefined,
      paymentIntent,
    });

    if (response?.error) {
      closeReservedPrintWindow(confirmContext);
      return {
        ok: false,
        error: `${response.code ? `[${response.code}] ` : ''}${response.error}`,
        code: response.code,
      };
    }

    const saleId = response?.saleId;
    if (!saleId) {
      closeReservedPrintWindow(confirmContext);
      return {
        ok: false,
        error: '❌ ไม่พบ ID ของรายการขายหลังจากยืนยัน',
      };
    }

    const finalSaleOption = projectSaleOption({ saleMode, saleOption });
    onSaleConfirmed?.(saleId, finalSaleOption, confirmContext);

    return {
      ok: true,
      saleId,
      saleOption: finalSaleOption,
      response,
    };
  } catch (error) {
    closeReservedPrintWindow(confirmContext);
    return {
      ok: false,
      error: `❌ ยืนยันการขายล้มเหลว: ${error?.message || 'เกิดข้อผิดพลาด'}`,
    };
  }
};
