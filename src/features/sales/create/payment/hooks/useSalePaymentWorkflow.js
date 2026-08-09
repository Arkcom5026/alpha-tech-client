import { useCallback, useEffect, useMemo, useState } from 'react';

import { executeSalePaymentConfirmation } from '../controllers/salePaymentConfirmationController';
import { projectSalePaymentCalculation, parseSalePaymentMoney } from '../services/salePaymentCalculation';
import { projectSalePaymentWorkflow } from '../projections/salePaymentWorkflowProjection';

export const useSalePaymentWorkflow = ({
  saleItems,
  isSubmitting,
  recovery,
  currentSaleMode,
  onSaleModeChange,
  saleOption,
  onSaleOptionChange,
  includeDeliveryNote,
  onIncludeDeliveryNoteChange,
  onConfirmSale,
  onSaleConfirmed,
  setClearPhoneTrigger,
  billDiscount,
  setBillDiscount,
  setPaymentAmount,
  paymentList,
  cardRef,
  setCardRef,
  resetSaleOrderAction,
  customerDepositAmount,
  selectedCustomer,
  selectedDeposit,
  depositUsed,
  setDepositUsed,
  clearCustomerAndDeposit,
  setCustomerIdAction,
}) => {
  const [paymentError, setPaymentError] = useState('');
  const [depositTouched, setDepositTouched] = useState(false);

  const effectiveCustomer = selectedCustomer || { id: null, name: 'ลูกค้าทั่วไป' };
  const hasValidCustomerId = Boolean(effectiveCustomer?.id);
  const customerType = effectiveCustomer?.type;
  const isCreditSale = currentSaleMode === 'CREDIT';

  const hasImmediatePayment = useMemo(
    () => (paymentList || []).some((payment) => {
      const method = String(payment?.method || '').toUpperCase();
      if (method === 'DEPOSIT') return false;
      return parseSalePaymentMoney(payment?.amount) > 0;
    }),
    [paymentList]
  );

  const calculation = useMemo(
    () => projectSalePaymentCalculation({
      saleItems,
      billDiscount,
      paymentList,
      depositUsed,
    }),
    [billDiscount, depositUsed, paymentList, saleItems]
  );

  useEffect(() => {
    if (depositTouched) return;
    setDepositUsed(Math.min(customerDepositAmount, calculation.totalToPay));
  }, [calculation.totalToPay, customerDepositAmount, depositTouched, setDepositUsed]);

  useEffect(() => {
    if (!isCreditSale) return;
    setPaymentAmount?.('CASH', '');
    setPaymentAmount?.('TRANSFER', '');
    setPaymentAmount?.('CARD', '');
    setCardRef?.('');
  }, [isCreditSale, setCardRef, setPaymentAmount]);

  useEffect(() => {
    if (recovery?.state === 'UNCERTAIN' && recovery?.message) {
      setPaymentError(recovery.message);
    }
  }, [recovery?.message, recovery?.state]);

  const changeDepositUsed = useCallback((input) => {
    const raw = typeof input === 'number' ? input : input?.target?.value;
    setDepositTouched(true);
    setDepositUsed(Math.min(parseSalePaymentMoney(raw), customerDepositAmount));
  }, [customerDepositAmount, setDepositUsed]);

  const changeSaleMode = useCallback((nextMode) => {
    const outstanding = Math.max(0, calculation.totalToPay - calculation.grandTotalPaid);
    if (nextMode === 'CREDIT' && outstanding > 0 && !hasValidCustomerId) {
      setPaymentError('การขายแบบเครดิตต้องเลือกชื่อลูกค้าก่อน (มียอดค้างชำระ)');
      return;
    }
    onSaleModeChange?.(nextMode);
  }, [calculation.grandTotalPaid, calculation.totalToPay, hasValidCustomerId, onSaleModeChange]);

  const changeBillDiscount = useCallback((input) => {
    const raw = typeof input === 'number' ? input : input?.target?.value;
    const discount = parseSalePaymentMoney(raw);
    if (discount < 0) {
      setBillDiscount(0);
      return;
    }
    if (discount <= calculation.totalOriginalPrice) setBillDiscount(discount);
  }, [calculation.totalOriginalPrice, setBillDiscount]);

  const isConfirmEnabled = !isSubmitting && (
    (currentSaleMode === 'CASH'
      && calculation.grandTotalPaid >= calculation.totalToPay
      && calculation.safeDepositUsed <= calculation.totalToPay
      && calculation.itemCount > 0)
    || (currentSaleMode === 'CREDIT'
      && calculation.itemCount > 0
      && hasValidCustomerId
      && !hasImmediatePayment)
  );

  const resetAfterSuccess = useCallback(() => {
    setDepositTouched(false);
    setDepositUsed(0);
    setCardRef('');
    setBillDiscount(0);
    resetSaleOrderAction?.();
    clearCustomerAndDeposit?.();
    setCustomerIdAction?.(null);
    setClearPhoneTrigger?.(Date.now());
    onSaleModeChange?.('CASH');
    onSaleOptionChange?.('NONE');
    onIncludeDeliveryNoteChange?.(false);
  }, [
    clearCustomerAndDeposit,
    onSaleModeChange,
    onSaleOptionChange,
    onIncludeDeliveryNoteChange,
    resetSaleOrderAction,
    setBillDiscount,
    setCardRef,
    setClearPhoneTrigger,
    setCustomerIdAction,
    setDepositUsed,
  ]);

  const confirm = useCallback(async (confirmContext = {}) => {
    if (isSubmitting) return null;
    setPaymentError('');

    try {
      const result = await executeSalePaymentConfirmation({
        calculation,
        saleMode: currentSaleMode,
        hasValidCustomerId,
        hasImmediatePayment,
        isSubmitting,
        paymentList,
        selectedDeposit,
        cardRef,
        customerType,
        saleOption,
        includeDeliveryNote,
        onConfirmSale,
        onSaleConfirmed,
        confirmContext,
      });

      if (!result?.ok) {
        const recoveryMessage = result?.recovery?.message || result?.error || 'ยืนยันการขายล้มเหลว';
        setPaymentError(`${result?.code ? `[${result.code}] ` : ''}${recoveryMessage}`);
        return null;
      }

      if (!result?.saleId) {
        setPaymentError('ไม่พบ ID ของรายการขายหลังจากยืนยัน');
        return null;
      }

      resetAfterSuccess();
      return result;
    } catch (error) {
      confirmContext?.printWindow?.close?.();
      setPaymentError(`❌ ยืนยันการขายล้มเหลว: ${error?.message || 'เกิดข้อผิดพลาด'}`);
      return null;
    }
  }, [
    calculation,
    cardRef,
    currentSaleMode,
    customerType,
    hasImmediatePayment,
    hasValidCustomerId,
    isSubmitting,
    onConfirmSale,
    onSaleConfirmed,
    paymentList,
    resetAfterSuccess,
    saleOption,
    includeDeliveryNote,
    selectedDeposit,
  ]);

  return projectSalePaymentWorkflow({
    calculation,
    paymentError,
    isConfirmEnabled,
    recovery,
    handlers: {
      confirm,
      changeDepositUsed,
      changeSaleMode,
      changeBillDiscount,
    },
  });
};
