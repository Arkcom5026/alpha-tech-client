// PaymentSection component (Refactored to use sub-components)
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import useSalesStore from '@/features/sales/store/salesStore';
import useCustomerDepositStore from '@/features/customerDeposit/store/customerDepositStore';
import usePaymentStore from '@/features/payment/store/paymentStore';
import { useNavigate } from 'react-router-dom';

// Import Components ย่อยๆ ที่สร้างขึ้นใหม่
import PaymentSummary from './PaymentSummary';
import PaymentMethodInput from './PaymentMethodInput';
import CalculationDetails from './CalculationDetails';

const PaymentSection = ({
  saleItems,
  isSubmitting,
  setIsSubmitting,
  onSaleConfirmed,
  setClearPhoneTrigger,
  onSaleModeChange,
}) => {
  const navigate = useNavigate();

  const {
    billDiscount,
    setBillDiscount,
    setPaymentAmount,
    paymentList,
    confirmSaleOrderAction,
    cardRef,
    setCardRef,
    resetSaleOrderAction,
    setCustomerIdAction,
  } = useSalesStore();

  const { submitMultiPaymentAction } = usePaymentStore();
  const {
    customerDepositAmount,
    selectedCustomer,
    selectedDeposit,
    depositUsed,
    setDepositUsed,
    applyDepositUsageAction,
    clearCustomerAndDeposit,
  } = useCustomerDepositStore();

  const [saleOption, setSaleOption] = useState('NONE');
  const [paymentError, setPaymentError] = useState('');
  const [currentSaleMode, setCurrentSaleMode] = useState('CASH');

  // 🔄 Sync sale mode to parent when toggled here
  useEffect(() => {
    if (typeof onSaleModeChange === 'function') {
      onSaleModeChange(currentSaleMode);
    }
  }, [currentSaleMode, onSaleModeChange]);

  const effectiveCustomer = selectedCustomer || { id: null, name: 'ลูกค้าทั่วไป' };
  const validSaleItems = Array.isArray(saleItems) ? saleItems : [];
  const totalOriginalPrice = validSaleItems.reduce((sum, item) => sum + (item.price || 0), 0);
  const totalDiscountOnly = validSaleItems.reduce((sum, item) => sum + (item.discountWithoutBill || 0), 0);
  const safeBillDiscount = typeof billDiscount === 'number' && !isNaN(billDiscount) ? billDiscount : 0;
  const totalDiscount = totalDiscountOnly + safeBillDiscount;
  const safeFinalPrice = Math.max(totalOriginalPrice - totalDiscountOnly - safeBillDiscount, 0);

  useEffect(() => {
    const suggested = Math.min(customerDepositAmount, safeFinalPrice);
    setDepositUsed(suggested);
  }, [customerDepositAmount, safeFinalPrice, setDepositUsed]);

  const handleDepositUsedChange = useCallback((e) => {
    const amount = parseFloat(e.target.value) || 0;
    const safeAmount = Math.min(amount, customerDepositAmount);
    setDepositUsed(safeAmount);
  }, [customerDepositAmount, setDepositUsed]);

  const priceBeforeVat = safeFinalPrice / 1.07;
  const vatAmount = safeFinalPrice - priceBeforeVat;
  const safeDepositUsed = Math.min(depositUsed, safeFinalPrice);

  const calc = useMemo(() => {
    const cashAmount = Number(paymentList.find(p => p.method === 'CASH')?.amount || 0);

    const totalPaid = paymentList.reduce((sum, p) => {
      const amount = parseFloat(p.amount);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    const paidByOther = totalPaid - cashAmount;
    const remainingToPay = Math.max(safeFinalPrice - paidByOther - safeDepositUsed, 0);
    const safeChangeAmount = Math.max(cashAmount - remainingToPay, 0);
    const totalPaidNet = totalPaid - safeChangeAmount;
    const grandTotalPaid = totalPaidNet + safeDepositUsed;

    return { cashAmount, totalPaid, paidByOther, remainingToPay, safeChangeAmount, totalPaidNet, grandTotalPaid, totalToPay: safeFinalPrice };
  }, [paymentList, safeFinalPrice, safeDepositUsed]);

  const hasValidCustomerId = !!effectiveCustomer?.id;
  const isConfirmEnabled =
    (currentSaleMode === 'CASH' && calc.totalPaid + safeDepositUsed >= calc.totalToPay && safeDepositUsed <= safeFinalPrice && hasValidCustomerId && validSaleItems.length > 0) ||
    (currentSaleMode === 'CREDIT' && hasValidCustomerId && validSaleItems.length > 0);

  const handleConfirm = useCallback(async () => {
    setPaymentError('');

    if (!hasValidCustomerId) {
      setPaymentError('กรุณาเลือกหรือสร้างข้อมูลลูกค้าก่อนยืนยันการขาย');
      return;
    }
    if (validSaleItems.length === 0) {
      setPaymentError('กรุณาเพิ่มรายการสินค้าก่อนยืนยันการขาย');
      return;
    }
    if (isSubmitting) {
      setPaymentError('กำลังดำเนินการ กรุณารอสักครู่');
      return;
    }
    if (currentSaleMode === 'CASH' && calc.totalPaid + safeDepositUsed < calc.totalToPay) {
      setPaymentError('ยอดเงินที่ชำระยังไม่เพียงพอ');
      return;
    }
    if (safeBillDiscount > totalOriginalPrice) {
      setPaymentError('ส่วนลดท้ายบิลห้ามเกินยอดรวมราคาสินค้า');
      return;
    }

    try {
      setIsSubmitting(true);
      const confirmedSale = await confirmSaleOrderAction();
      if (confirmedSale?.id) {
        const updatedPayments = [...paymentList];

        if (safeDepositUsed > 0 && selectedDeposit?.id) {
          updatedPayments.push({ method: 'DEPOSIT', amount: safeDepositUsed, customerDepositId: selectedDeposit.id });
        }

        if (currentSaleMode === 'CASH') {
          const validPayments = updatedPayments.filter(p => parseFloat(p.amount) > 0);
          if (validPayments.length === 0 && safeDepositUsed === 0) {
            setPaymentError("⚠️ ไม่มีรายการชำระเงินที่มีจำนวนเงินที่มากกว่า 0 หรือใช้มัดจำ");
            return;
          }
        }

        await submitMultiPaymentAction({
          saleId: confirmedSale.id,
          netPaid: calc.grandTotalPaid,
          paymentList: updatedPayments,
        });

        if (safeDepositUsed > 0 && selectedDeposit?.id) {
          await applyDepositUsageAction({
            depositId: selectedDeposit.id,
            amountUsed: safeDepositUsed,
            saleId: confirmedSale.id,
          });
        }

        if (saleOption === 'RECEIPT') {
          navigate('/pos/sales/bill/print-short/' + confirmedSale.id, { state: { payment: updatedPayments } });
        } else if (saleOption === 'TAX_INVOICE') {
          navigate('/pos/sales/bill/print-full/' + confirmedSale.id, { state: { payment: updatedPayments } });
        } else if (saleOption === 'NONE' && currentSaleMode === 'CREDIT') {
          navigate('/pos/sale');
        }

        if (typeof onSaleConfirmed === 'function') {
          onSaleConfirmed();
        }
      } else {
        setPaymentError('❌ ไม่พบ ID ของรายการขายหลังจากยืนยัน');
      }
    } catch (err) {
      setPaymentError('❌ ยืนยันการขายล้มเหลว: ' + (err.message || 'เกิดข้อผิดพลาด'));
    } finally {
      setTimeout(() => {
        const phoneInput = document.getElementById('customer-phone-input');
        if (phoneInput) {
          phoneInput.focus();
          phoneInput.select();
        }
      }, 100);

      setIsSubmitting(false);
      setDepositUsed(0);
      setCardRef('');
      setBillDiscount(0);
      resetSaleOrderAction?.();
      clearCustomerAndDeposit();
      setCustomerIdAction(null);
      setClearPhoneTrigger?.(Date.now());
      onSaleModeChange('CASH');
    }
  }, [
    hasValidCustomerId,
    validSaleItems.length,
    isSubmitting,
    safeDepositUsed,
    safeBillDiscount,
    totalOriginalPrice,
    confirmSaleOrderAction,
    paymentList,
    selectedDeposit?.id,
    submitMultiPaymentAction,
    applyDepositUsageAction,
    saleOption,
    navigate,
    onSaleConfirmed,
    setDepositUsed,
    setCardRef,
    setBillDiscount,
    resetSaleOrderAction,
    clearCustomerAndDeposit,
    setCustomerIdAction,
    setClearPhoneTrigger,
    setIsSubmitting,
    currentSaleMode,
    onSaleModeChange,
    calc
  ]);

  const handleBillDiscountChange = useCallback((e) => {
    const newDiscount = Number(e.target.value) || 0;
    if (newDiscount >= 0 && newDiscount <= totalOriginalPrice) {
      setBillDiscount(newDiscount);
    } else if (newDiscount < 0) {
      setBillDiscount(0);
    }
  }, [setBillDiscount, totalOriginalPrice]);

  return (
    <div className='font-bold min-w-[1530px]'>
      <div className="bg-white  flex justify-center gap-4 py-4">
        <CalculationDetails
          totalOriginalPrice={totalOriginalPrice}
          totalDiscountOnly={totalDiscountOnly}
          billDiscount={billDiscount}
          setBillDiscount={handleBillDiscountChange}
          totalDiscount={totalDiscount}
          priceBeforeVat={priceBeforeVat}
          vatAmount={vatAmount}
          customerDepositAmount={customerDepositAmount}
          depositUsed={depositUsed}
          handleDepositUsedChange={handleDepositUsedChange}
        />

        <PaymentMethodInput
          cash={paymentList.find(p => p.method === 'CASH')?.amount || ''}
          transfer={paymentList.find(p => p.method === 'TRANSFER')?.amount || ''}
          credit={paymentList.find(p => p.method === 'CREDIT')?.amount || ''}
          onCashChange={(e) => setPaymentAmount('CASH', e.target.value)}
          onTransferChange={(e) => setPaymentAmount('TRANSFER', e.target.value)}
          onCreditChange={(e) => setPaymentAmount('CREDIT', e.target.value)}
          cardRef={cardRef}
          onCardRefChange={(e) => setCardRef(e.target.value)}
        />

        <PaymentSummary
          totalToPay={calc.totalToPay}
          grandTotalPaid={calc.grandTotalPaid}
          safeChangeAmount={calc.safeChangeAmount}
          isConfirmEnabled={isConfirmEnabled}
          isSubmitting={isSubmitting}
          onConfirm={handleConfirm}
          paymentError={paymentError}
          saleOption={saleOption}
          setSaleOption={setSaleOption}
          currentSaleMode={currentSaleMode}
          setCurrentSaleMode={setCurrentSaleMode}
        />
      </div>
    </div>
  );
};

export default PaymentSection;