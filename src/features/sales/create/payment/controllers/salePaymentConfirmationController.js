import { mapSalePaymentIntent } from '../services/salePaymentIntentMapper';
import { validateSalePaymentConfirmation } from '../services/salePaymentValidation';
import { issueOutputTaxDocument } from '@/features/tax/intake/api/taxIntakeApi';

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

    if (saleMode === 'CASH') {
      const taxDocumentId = Number(response?.taxIntake?.taxDocumentId || 0);
      if (!taxDocumentId) {
        const error = new Error('บันทึกการขายแล้ว แต่ยังส่งรายการเข้าสู่ทะเบียนภาษีขายไม่สำเร็จ');
        error.code = response?.taxIntake?.code || 'OUTPUT_TAX_PUBLICATION_PENDING';
        throw error;
      }
      const taxInvoiceKind = saleOption === 'TAX_INVOICE' ? 'FULL' : 'SHORT';
      const issued = await issueOutputTaxDocument({
        branchId: response?.sale?.branchId,
        taxDocumentId,
        taxInvoiceKind,
      });
      const issuedDocumentId = Number(issued?.document?.id || taxDocumentId);
      const finalTaxOption = taxInvoiceKind === 'FULL' ? 'TAX_DOCUMENT_FULL' : 'TAX_DOCUMENT_SHORT';
      onSaleConfirmed?.(issuedDocumentId, finalTaxOption, confirmContext);
      return {
        ok: true,
        saleId,
        taxDocumentId: issuedDocumentId,
        saleOption: finalTaxOption,
        response,
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
