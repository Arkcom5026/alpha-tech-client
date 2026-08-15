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

const openShortReceiptFallback = ({ saleId, saleOption, onSaleConfirmed, confirmContext }) => {
  if (saleOption !== 'RECEIPT' || typeof onSaleConfirmed !== 'function') return false;
  onSaleConfirmed(saleId, 'RECEIPT', confirmContext);
  return true;
};

const projectPostSaleDocumentWarning = ({ saleId, code, message, cause, fallbackOpened = false }) => ({
  code: code || 'POST_SALE_DOCUMENT_FAILED',
  message: message || 'ขายสำเร็จ แต่ออกเอกสารภาษีไม่สำเร็จ',
  detail:
    cause?.response?.data?.message ||
    cause?.response?.data?.error ||
    cause?.message ||
    'กรุณาตรวจสอบการตั้งค่าผู้ออกเอกสารภาษี แล้วพิมพ์เอกสารย้อนหลัง',
  saleId,
  fallbackOpened,
  printHistoryPath: '../bill',
  taxIssuerSettingsPath: '../../settings/tax-issuer',
});

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
    changeAmount: calculation?.changeAmount,
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
    const deliveryNoteMode =
      saleMode === 'CREDIT' ? 'PRINT' : includeDeliveryNote ? 'PRINT' : undefined;

    const response = await onConfirmSale({
      deliveryNoteMode,
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
      const completion = response?.data || response;
      if (saleOption === 'ORDINARY_RECEIPT') {
        const paymentId = Number(completion?.payments?.[0]?.id || 0);
        if (!paymentId) {
          closeReservedPrintWindow(confirmContext);
          return {
            ok: true,
            saleId,
            response,
            warning: projectPostSaleDocumentWarning({
              saleId,
              code: 'PAYMENT_RECEIPT_HANDOFF_FAILED',
              message: 'ขายสำเร็จ แต่ยังเปิดใบเสร็จรับเงินไม่สำเร็จ',
              cause: new Error('ไม่พบรายการรับชำระสำหรับออกใบเสร็จรับเงิน'),
            }),
          };
        }
        onSaleConfirmed?.(saleId, 'ORDINARY_RECEIPT', { ...confirmContext, paymentId });
        return { ok: true, saleId, paymentId, saleOption: 'ORDINARY_RECEIPT', response };
      }

      const taxDocumentId = Number(completion?.taxIntake?.taxDocumentId || response?.taxIntake?.taxDocumentId || 0);
      if (!taxDocumentId) {
        const fallbackOpened = openShortReceiptFallback({
          saleId,
          saleOption,
          onSaleConfirmed,
          confirmContext,
        });
        if (!fallbackOpened) closeReservedPrintWindow(confirmContext);
        return {
          ok: true,
          saleId,
          response,
          warning: projectPostSaleDocumentWarning({
            saleId,
            code: completion?.taxIntake?.code || response?.taxIntake?.code || 'OUTPUT_TAX_PUBLICATION_PENDING',
            message: fallbackOpened
              ? 'ขายสำเร็จ และเปิดใบกำกับภาษีอย่างย่อสำรองแล้ว แต่ TaxDocument ยังไม่พร้อม'
              : 'ขายสำเร็จ แต่ยังสร้างเอกสารภาษีไม่สำเร็จ',
            cause: new Error('รายการยังไม่พร้อมสำหรับการออกเอกสารภาษี กรุณาตรวจสอบ TaxDocument authority ภายหลัง'),
            fallbackOpened,
          }),
        };
      }

      const taxInvoiceKind = saleOption === 'TAX_INVOICE' ? 'FULL' : 'SHORT';
      try {
        const issued = await issueOutputTaxDocument({
          branchId: completion?.sale?.branchId || response?.sale?.branchId,
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
      } catch (issuanceError) {
        const fallbackOpened = openShortReceiptFallback({
          saleId,
          saleOption,
          onSaleConfirmed,
          confirmContext,
        });
        if (!fallbackOpened) closeReservedPrintWindow(confirmContext);
        return {
          ok: true,
          saleId,
          taxDocumentId,
          response,
          warning: projectPostSaleDocumentWarning({
            saleId,
            code:
              issuanceError?.response?.data?.code ||
              issuanceError?.code ||
              'TAX_DOCUMENT_ISSUANCE_FAILED',
            message: fallbackOpened
              ? 'ขายสำเร็จ และเปิดใบกำกับภาษีอย่างย่อสำรองแล้ว แต่ TaxDocument ยังออกไม่สำเร็จ'
              : 'ขายสำเร็จ แต่ออกเอกสารภาษีไม่สำเร็จ',
            cause: issuanceError,
            fallbackOpened,
          }),
        };
      }
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
